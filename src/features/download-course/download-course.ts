import type { AsyncZippable, Zippable } from 'fflate'
import type { MoodleClientFunctionTypes } from 'moodle-typed-ws'
import { zip, zipSync } from 'fflate'
import pLimit from 'p-limit'
import { MOODLE_WS_URL } from '@/shared/config/moodle'
import { downloadFileByUrl } from '@/shared/moodle-ws-api/download-file'
import { getStored } from '@/shared/storage'

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
    throw new Error('Not signed in to Moodle (no Web Services token)')

  const body = new URLSearchParams({
    wstoken: token,
    wsfunction,
    moodlewsrestformat: 'json',
    ...params,
  })

  const resp = await fetch(MOODLE_WS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!resp.ok)
    throw new Error(`Moodle WS ${wsfunction} failed: HTTP ${resp.status}`)

  const data = await resp.json()
  if (data && typeof data === 'object' && 'errorcode' in data)
    throw new Error(`Moodle WS ${wsfunction}: ${(data as { errorcode: string }).errorcode}`)

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

function buildZip(entries: AsyncZippable): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const toBlob = (data: Uint8Array) => new Blob([data], { type: 'application/zip' })
    const sync = () => {
      try {
        resolve(toBlob(zipSync(entries as Zippable, ZIP_OPTIONS)))
      }
      catch (e) {
        reject(e)
      }
    }

    try {
      // Async zip spins up a Web Worker, which can fail inside a Firefox
      // content-script sandbox — fall back to the synchronous packer.
      zip(entries, ZIP_OPTIONS, (err, data) => {
        if (err)
          sync()
        else
          resolve(toBlob(data))
      })
    }
    catch {
      sync()
    }
  })
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

  const entries: AsyncZippable = {}
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
        entries[file.path] = new Uint8Array(await blob.arrayBuffer())
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

  const blob = await buildZip(entries)
  const filename = `${sanitizeSegment(courseName)}.zip`

  return { blob, filename, fileCount: Object.keys(entries).length, skipped }
}
