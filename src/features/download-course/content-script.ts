import { fetchCourseArchive } from './download-course'
import { triggerDownload } from '@/shared/ui/trigger-download'

const BUTTON_ID = 'innohassle-course-download'
const IDLE_LABEL = '⬇ Download course'
const LOG = '[InNoHassle] course-download:'

const BUTTON_STYLE: Record<string, string> = {
  'position': 'fixed',
  'top': '140px',
  'right': '16px',
  'z-index': '2147483647',
  'margin': '0',
  'padding': '8px 16px',
  'border': 'none',
  'border-radius': '999px',
  'background-color': '#9747ff',
  'color': '#fff',
  'font': 'bold 14px/1 system-ui, -apple-system, sans-serif',
  'cursor': 'pointer',
  'box-shadow': '0 2px 8px rgba(0, 0, 0, 0.25)',
}

/** True when the current page is a Moodle course view. */
function isCoursePage(): boolean {
  return Boolean(document.body?.classList.contains('path-course-view'))
    || window.location.pathname === '/course/view.php'
}

/** Course id from Moodle's `course-<id>` body class, falling back to `?id=`. */
function findCourseId(): number | undefined {
  for (const cls of document.body?.classList ?? []) {
    const match = /^course-(\d+)$/.exec(cls)
    if (match)
      return Number(match[1])
  }

  const id = Number(new URLSearchParams(window.location.search).get('id'))
  return Number.isInteger(id) && id > 1 ? id : undefined
}

/** Best-effort human readable course name for the archive file name. */
function readCourseName(courseId: number): string {
  const heading = document.querySelector<HTMLElement>('.page-header-headings h1, #page-header h1')
  return heading?.textContent?.trim() || document.title.trim() || `course-${courseId}`
}

function setBusy(button: HTMLButtonElement, busy: boolean) {
  button.disabled = busy
  button.style.setProperty('opacity', busy ? '0.7' : '1', 'important')
  button.style.setProperty('cursor', busy ? 'progress' : 'pointer', 'important')
}

function buildButton(courseId: number): HTMLButtonElement {
  const button = document.createElement('button')
  button.id = BUTTON_ID
  button.type = 'button'
  button.textContent = IDLE_LABEL
  for (const [prop, value] of Object.entries(BUTTON_STYLE))
    button.style.setProperty(prop, value, 'important')

  let running = false
  button.addEventListener('click', async () => {
    if (running)
      return
    running = true
    setBusy(button, true)

    try {
      const { blob, filename, skipped } = await fetchCourseArchive(
        courseId,
        readCourseName(courseId),
        ({ completed, total }) => {
          button.textContent = `Downloading ${completed}/${total}…`
        },
      )
      triggerDownload(blob, filename)
      button.textContent = skipped.length ? `Done — ${skipped.length} skipped` : 'Done ✓'
    }
    catch (e) {
      console.log(LOG, 'download failed', e)
      button.textContent = 'Download failed'
    }
    finally {
      running = false
      setBusy(button, false)
      setTimeout(() => {
        button.textContent = IDLE_LABEL
      }, 4000)
    }
  })

  return button
}

function ensureButton() {
  if (!document.body || document.getElementById(BUTTON_ID))
    return
  if (!isCoursePage())
    return

  const courseId = findCourseId()
  if (courseId === undefined) {
    console.log(LOG, 'on a course page but could not resolve the course id')
    return
  }

  document.body.appendChild(buildButton(courseId))
  console.log(LOG, 'button injected for course', courseId)
}

/**
 * Show a floating "Download course" button in the upper-right corner of a
 * Moodle course page. Clicking it archives every file of the course as a ZIP
 * using the same {@link fetchCourseArchive} flow as the popup.
 */
export function injectCourseDownloadButton() {
  console.log(LOG, 'content script loaded on', window.location.pathname)

  const attempt = () => {
    try {
      ensureButton()
    }
    catch (e) {
      console.log(LOG, 'inject failed', e)
    }
  }

  attempt()
  if (document.readyState !== 'complete') {
    document.addEventListener('DOMContentLoaded', attempt, { once: true })
    window.addEventListener('load', attempt, { once: true })
  }
  // Moodle sometimes finishes rendering the header after `load`
  setTimeout(attempt, 1000)
  setTimeout(attempt, 3000)
}
