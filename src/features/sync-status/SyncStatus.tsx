import { useStorage } from '@/shared/storage'
import { cn } from '@/shared/ui/utils'

// A sync that never cleared its marker (the worker was killed mid-run) stops counting as running after this
const STALE_AFTER_MS = 10 * 60 * 1000

function StatusRow({ label, lastSuccessMS, error, startedMS }: {
  label: string
  lastSuccessMS: number | undefined
  error: string | undefined
  startedMS: number | undefined
}) {
  const syncing = startedMS !== undefined && Date.now() - startedMS < STALE_AFTER_MS

  let icon = 'icon-[material-symbols--schedule-outline-rounded] text-base-content/50'
  let text = 'Not synced yet'
  if (syncing) {
    icon = 'icon-[material-symbols--progress-activity] animate-spin text-primary'
    text = 'Syncing…'
  }
  else if (error) {
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
        <div className={cn('text-xs', error && !syncing ? 'text-error' : 'text-base-content/50')}>{text}</div>
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
  const dataStartedMS = useStorage('moodleSyncStartedMS')
  const calendarLastSuccessMS = useStorage('calendarSyncLastSuccessMS')
  const calendarError = useStorage('calendarSyncLastError')
  const calendarStartedMS = useStorage('calendarSyncStartedMS')

  return (
    <div className={cn('flex flex-col gap-2', increased ? 'px-5 py-4' : 'border-t border-base-300 px-4 py-2.5')}>
      <StatusRow label="Calendar → InNoHassle" lastSuccessMS={calendarLastSuccessMS} error={calendarError} startedMS={calendarStartedMS} />
      {dataEnabled && (
        <StatusRow label="Moodle data → InNoHassle search" lastSuccessMS={dataLastSuccessMS} error={dataError} startedMS={dataStartedMS} />
      )}
    </div>
  )
}
