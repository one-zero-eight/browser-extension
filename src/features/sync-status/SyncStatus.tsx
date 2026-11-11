import { useStorage } from '@/shared/storage'
import { cn } from '@/shared/ui/utils'

function StatusRow({ label, lastSuccessMS, error }: {
  label: string
  lastSuccessMS: number | undefined
  error: string | undefined
}) {
  let icon = 'icon-[material-symbols--schedule-outline-rounded] text-base-content/50'
  let text = 'Not synced yet'
  if (error) {
    icon = 'icon-[material-symbols--error-outline-rounded] text-error'
    text = error
  }
  else if (lastSuccessMS) {
    icon = 'icon-[material-symbols--check-circle-outline-rounded] text-success'
    text = `Synced ${new Date(lastSuccessMS).toLocaleString()}`
  }

  return (
    <div className="flex items-start gap-2">
      <span className={cn(icon, 'mt-0.5 shrink-0 text-base')} />
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        <div className={cn('text-xs', error ? 'text-error' : 'text-base-content/50')}>{text}</div>
      </div>
    </div>
  )
}

/**
 * Outcome of the two syncs to InNoHassle: the Moodle calendar (always on) and the Moodle data for search
 * (only when the user turned it on).
 */
export function SyncStatus({ increased = false }: { increased?: boolean }) {
  const dataEnabled = useStorage('moodleSyncEnabled') === true
  const dataLastSuccessMS = useStorage('moodleSyncLastSuccessMS')
  const dataError = useStorage('moodleSyncLastError')
  const calendarLastSuccessMS = useStorage('calendarSyncLastSuccessMS')
  const calendarError = useStorage('calendarSyncLastError')

  return (
    <div className={cn('flex flex-col gap-2', increased ? 'px-5 py-4' : 'border-t border-base-300 px-4 py-2.5')}>
      <StatusRow label="Calendar → InNoHassle" lastSuccessMS={calendarLastSuccessMS} error={calendarError} />
      {dataEnabled && (
        <StatusRow label="Moodle data → InNoHassle search" lastSuccessMS={dataLastSuccessMS} error={dataError} />
      )}
    </div>
  )
}
