import { useRef, useState } from 'react'
import { fetchCourseArchive } from './download-course'
import { triggerDownload } from '@/shared/ui/trigger-download'
import { cn } from '@/shared/ui/utils'

type State =
  | { status: 'idle' }
  | { status: 'loading', completed: number, total: number }
  | { status: 'done', skipped: number }
  | { status: 'error', message: string }

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
      setState({ status: 'error', message: e instanceof Error ? e.message : 'Download failed' })
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

  const icon = {
    idle: 'i-material-symbols-folder-zip-outline-rounded',
    loading: 'i-material-symbols-progress-activity animate-spin',
    done: 'i-material-symbols-check-circle-outline-rounded',
    error: 'i-material-symbols-error-outline-rounded',
  }[state.status]

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state.status === 'loading'}
      title={state.status === 'error' ? state.message : `Download all files of "${courseName}" as a ZIP archive`}
      className={cn(
        'flex h-fit shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-normal',
        state.status === 'error'
          ? 'bg-red-900'
          : 'bg-[#9747FF] hover:bg-[#6600CC] disabled:bg-[#6600CC]',
      )}
    >
      <span className={cn(icon, 'text-sm')} />
      <span className="max-w-40 truncate">{label}</span>
    </button>
  )
}
