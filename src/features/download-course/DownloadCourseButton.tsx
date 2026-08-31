import { useRef, useState } from 'react'
import { fetchCourseArchive } from './download-course'
import { MOODLE_DASHBOARD_URL } from '@/shared/config/moodle'
import { isMoodleNotSignedInError } from '@/shared/moodle-ws-api/not-signed-in-error'
import { triggerDownload } from '@/shared/ui/trigger-download'
import { cn } from '@/shared/ui/utils'

type State =
  | { status: 'idle' }
  | { status: 'loading', completed: number, total: number }
  | { status: 'done', skipped: number }
  | { status: 'error', message: string, needsSignIn?: boolean }

export function DownloadCourseButton({ courseId, courseName }: {
  courseId: number
  courseName: string
}) {
  const [state, setState] = useState<State>({ status: 'idle' })
  const resetTimer = useRef<ReturnType<typeof setTimeout>>()

  function resetLater(ms: number) {
    clearTimeout(resetTimer.current)
    resetTimer.current = setTimeout(() => setState({ status: 'idle' }), ms)
  }

  async function onClick() {
    if (state.status === 'loading')
      return

    if (state.status === 'error' && state.needsSignIn) {
      window.open(MOODLE_DASHBOARD_URL, '_blank', 'noopener')
      return
    }

    clearTimeout(resetTimer.current)
    setState({ status: 'loading', completed: 0, total: 0 })
    try {
      const { blob, filename, skipped } = await fetchCourseArchive(
        courseId,
        courseName,
        ({ completed, total }) => setState({ status: 'loading', completed, total }),
      )
      triggerDownload(blob, filename)
      setState({ status: 'done', skipped: skipped.length })
      if (skipped.length)
        console.log('Skipped files:', skipped)
      resetLater(4000)
    }
    catch (e) {
      console.log('Course archive failed', e)
      if (isMoodleNotSignedInError(e)) {
        setState({ status: 'error', message: 'Sign in to Moodle', needsSignIn: true })
      }
      else {
        setState({ status: 'error', message: e instanceof Error ? e.message : 'Download failed' })
      }
      resetLater(5000)
    }
  }

  const label = (() => {
    switch (state.status) {
      case 'loading':
        return state.total > 0 ? `${state.completed}/${state.total}` : '…'
      case 'done':
        return state.skipped > 0 ? `Done (${state.skipped} skipped)` : 'Done'
      case 'error':
        return state.message
      default:
        return 'Download .zip'
    }
  })()

  const needsSignIn = state.status === 'error' && state.needsSignIn

  const title = (() => {
    if (needsSignIn)
      return 'Open Moodle in a new tab to sign in, then try again'
    if (state.status === 'error')
      return state.message
    return `Download all files of "${courseName}" as a ZIP archive`
  })()

  const icon = needsSignIn
    ? 'icon-[material-symbols--login-rounded]'
    : {
        idle: 'icon-[material-symbols--folder-zip-outline-rounded]',
        loading: 'icon-[material-symbols--progress-activity] animate-spin',
        done: 'icon-[material-symbols--check-circle-outline-rounded]',
        error: 'icon-[material-symbols--error-outline-rounded]',
      }[state.status]

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state.status === 'loading'}
      title={title}
      aria-label={label}
      className={cn(
        'btn btn-sm',
        state.status === 'idle' && 'btn-ghost btn-square',
        state.status === 'loading' && 'btn-primary',
        state.status === 'done' && 'btn-primary',
        state.status === 'error' && (needsSignIn ? 'btn-primary' : 'btn-error'),
      )}
    >
      <span className={cn(icon, 'text-lg', state.status === 'idle' && 'text-base-content/50')} />
      {state.status !== 'idle' && <span className="max-w-32 truncate">{label}</span>}
    </button>
  )
}
