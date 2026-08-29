import type { Zippable } from 'fflate'
import type { MoodleClientFunctionTypes } from 'moodle-typed-ws'
import { zipSync } from 'fflate'
import pLimit from 'p-limit'
import { MOODLE_WS_URL } from '@/shared/config/moodle'
import { downloadFileByUrl } from '@/shared/moodle-ws-api/download-file'
import { MoodleNotSignedInError } from '@/shared/moodle-ws-api/not-signed-in-error'
import { getStored, removeStored } from '@/shared/storage'

type CourseSections = MoodleClientFunctionTypes.CoreCourseGetContentsWSResponse

/**
 * Call a Moodle Web Services function with plain `fetch`.
 *
 * The shared Axios client can't be used here: this module runs inside a Firefox
 * content-script sandbox, where Axios' adapters throw "Permission denied to
 * access property" while inspecting `document` / `Headers`. `fetch` + `.json()`
 * never touches those, so it works in every context (content script, popup, SW).
 */
async function callMoodleWs<T>(wsfunction: string, params: Record<string, string>): Promise<T> {
  const token = await getStored('token')
  if (!token)
    throw new MoodleNotSignedInError()

  // Build the form body as a plain string. Passing a URLSearchParams instance
  // to `fetch` triggers a branded type-check that throws "Permission denied to
  // access property" across the Firefox content-script compartment boundary.
  const body = Object.entries({
    wstoken: token,
    wsfunction,
    moodlewsrestformat: 'json',
    ...params,
  })
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')

  const resp = await fetch(MOODLE_WS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!resp.ok)
    throw new Error(`Moodle WS ${wsfunction} failed: HTTP ${resp.status}`)

  const data = await resp.json()
  if (data && typeof data === 'object' && 'errorcode' in data) {
    const errorcode = (data as { errorcode: string }).errorcode
    if (errorcode === 'invalidtoken' || errorcode === 'accessexception') {
      // This path never touches the shared Axios client, so nothing else clears
      // the stale token. Drop it so the next Moodle page visit re-scrapes one.
      await removeStored('token')
      throw new MoodleNotSignedInError('Your Moodle session expired — sign in again')
    }
    throw new Error(`Moodle WS ${wsfunction}: ${errorcode}`)
  }

  return data as T
}

// How many files to download from Moodle at the same time
const DOWNLOAD_CONCURRENCY = 4
// Files bigger than this are skipped to keep the whole archive in memory
const MAX_FILE_SIZE_BYTES = 250 * 1024 * 1024

export interface ArchiveProgress {
  /** Total number of files planned for download */
  total: number
  /** Number of files already downloaded (successfully or not) */
  completed: number
  /** Name of the file that finished last */
  currentFile: string
}

export interface ArchiveResult {
  blob: Blob
  filename: string
  /** Number of files actually put into the archive */
  fileCount: number
  /** Paths that were skipped (too big or failed to download) */
  skipped: string[]
}

interface PlannedFile {
  /** Path inside the archive */
  path: string
  url: string
  size: number
}

/** Characters that are invalid in file paths on Windows / macOS / Linux. */
// eslint-disable-next-line no-control-regex
const UNSAFE_PATH_CHARS = /[<>:"/\\|?*\x00-\x1F]/g

/** Make a single path segment (folder or file name) safe on every OS. */
function sanitizeSegment(name: string): string {
  const cleaned = name
    .replace(UNSAFE_PATH_CHARS, '_')
    .replace(/\s+/g, ' ')
    .replace(/[\s.]+$/, '')
    .trim()
    .slice(0, 120)
  return cleaned || 'untitled'
}

/** Normalize a Moodle `filepath` (e.g. `/`, `/sub/dir/`) into `sub/dir/`. */
function sanitizeFilepath(filepath: string | undefined): string {
  if (!filepath || filepath === '/')
    return ''
  return filepath
    .split('/')
    .filter(Boolean)
    .map(sanitizeSegment)
    .join('/')
    .concat('/')
}

/** Walk the course structure and collect every downloadable file with a unique path. */
function planFiles(sections: CourseSections): PlannedFile[] {
  const files: PlannedFile[] = []
  const usedPaths = new Set<string>()

  sections.forEach((section, sectionIndex) => {
    const sectionDir = `${String(sectionIndex).padStart(2, '0')} ${sanitizeSegment(section.name)}`

    for (const module of section.modules ?? []) {
      const moduleDir = sanitizeSegment(module.name)

      for (const content of module.contents ?? []) {
        if (content.type !== 'file' || !content.fileurl)
          continue

        const dir = `${sectionDir}/${moduleDir}/${sanitizeFilepath(content.filepath)}`
        let path = `${dir}${sanitizeSegment(content.filename || 'file')}`

        // Deduplicate identical paths by appending an index before the extension
        if (usedPaths.has(path)) {
          const dot = path.lastIndexOf('.')
          const [stem, ext] = dot > 0 ? [path.slice(0, dot), path.slice(dot)] : [path, '']
          let i = 2
          while (usedPaths.has(`${stem} (${i})${ext}`))
            i += 1
          path = `${stem} (${i})${ext}`
        }
        usedPaths.add(path)

        files.push({ path, url: content.fileurl, size: content.filesize ?? 0 })
      }
    }
  })

  return files
}

// level 1: course files (pdf, pptx, images, video) barely compress, favour speed
const ZIP_OPTIONS = { level: 1 } as const

function buildZip(entries: Zippable): Blob {
  // Synchronous packer only. fflate's async `zip()` clones the input typed
  // arrays via `new value.constructor(value)` before handing them to a Worker,
  // and reading `.constructor` throws "Permission denied to access property"
  // on cross-compartment arrays inside a Firefox content-script sandbox.
  return new Blob([zipSync(entries, ZIP_OPTIONS)], { type: 'application/zip' })
}

/**
 * Download every file of a Moodle course and pack them into a single ZIP archive.
 *
 * The returned blob keeps Moodle's section / activity structure as folders.
 * Files that are too large or fail to download are skipped and reported in
 * {@link ArchiveResult.skipped} instead of aborting the whole archive.
 */
export async function fetchCourseArchive(
  courseId: number,
  courseName: string,
  onProgress?: (progress: ArchiveProgress) => void,
): Promise<ArchiveResult> {
  const sections = await callMoodleWs<CourseSections>('core_course_get_contents', {
    courseid: String(courseId),
  })
  const planned = planFiles(sections)

  if (planned.length === 0)
    throw new Error('This course has no downloadable files')

  const entries: Zippable = {}
  const skipped: string[] = []
  let completed = 0

  const limit = pLimit(DOWNLOAD_CONCURRENCY)
  await Promise.all(
    planned.map(file => limit(async () => {
      try {
        if (file.size > MAX_FILE_SIZE_BYTES) {
          skipped.push(file.path)
          return
        }
        const blob = await downloadFileByUrl(file.url)
        // Copy into a Uint8Array owned by this realm: bytes coming from
        // fetch().blob() can be cross-compartment in a Firefox content-script
        // sandbox, which breaks fflate's typed-array handling.
        const source = new Uint8Array(await blob.arrayBuffer())
        const bytes = new Uint8Array(source.length)
        bytes.set(source)
        entries[file.path] = bytes
      }
      catch (e) {
        console.log(`Couldn't download ${file.path}`, e)
        skipped.push(file.path)
      }
      finally {
        completed += 1
        onProgress?.({ total: planned.length, completed, currentFile: file.path })
      }
    })),
  )

  if (Object.keys(entries).length === 0)
    throw new Error('Failed to download any file from this course')

  const blob = buildZip(entries)
  const filename = `${sanitizeSegment(courseName)}.zip`

  return { blob, filename, fileCount: Object.keys(entries).length, skipped }
}
