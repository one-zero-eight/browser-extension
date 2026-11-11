import { sendMessage } from '@/shared/messages'
import { setStored, useStorage } from '@/shared/storage'
import { cn } from '@/shared/ui/utils'

export function MoodleSyncToggle({ increased = false }: { increased?: boolean }) {
  const enabled = useStorage('moodleSyncEnabled') === true
  const lastError = useStorage('moodleSyncLastError')
  const lastSuccessMS = useStorage('moodleSyncLastSuccessMS')

  async function toggle() {
    if (enabled) {
      sendMessage('MOODLE_SYNC_DISABLE')
    }
    else {
      await setStored('moodleSyncEnabled', true)
      sendMessage('MOODLE_SYNC_NOW')
    }
  }

  return (
    <div
      className={cn(
        'flex w-full items-center justify-between gap-4',
        increased ? 'px-5 py-4' : 'border-t border-base-300 px-4 py-2.5',
      )}
    >
      <div className="min-w-0">
        <div className="text-sm font-medium">Send Moodle data to InNoHassle</div>
        <div className="mt-0.5 text-xs text-base-content/50">
          Calendar, deadlines, grades, progress and the text of your courses, for your InNoHassle calendar and
          recommendations. Turning it off deletes them from InNoHassle.
        </div>
        {lastError
          ? <div className="mt-0.5 text-xs text-error">{lastError}</div>
          : enabled && lastSuccessMS
            ? <div className="mt-0.5 text-xs text-base-content/50">{`Last synced ${new Date(lastSuccessMS).toLocaleString()}`}</div>
            : null}
      </div>
      <input
        type="checkbox"
        className={cn(
          'toggle toggle-primary',
          increased && 'text-white',
        )}
        checked={enabled}
        aria-label="Send Moodle data to InNoHassle"
        onChange={toggle}
      />
    </div>
  )
}
