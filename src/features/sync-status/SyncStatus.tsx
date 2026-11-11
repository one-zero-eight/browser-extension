import type { CourseSyncReport, CourseSyncState, DataSyncReport } from '@/features/moodle-sync/report'
import { useStorage } from '@/shared/storage'
import { cn } from '@/shared/ui/utils'

// A sync that never cleared its marker (the worker was killed mid-run) stops counting as running after this
const STALE_AFTER_MS = 10 * 60 * 1000

const COURSE_STATE: Record<CourseSyncState, { icon: string, label: string }> = {
  waiting: { icon: 'icon-[material-symbols--schedule-outline-rounded] text-base-content/50', label: 'Waiting' },
  syncing: { icon: 'icon-[material-symbols--progress-activity] animate-spin text-primary', label: 'Syncing…' },
  sent: { icon: 'icon-[material-symbols--check-circle-outline-rounded] text-success', label: 'Sent' },
  unchanged: { icon: 'icon-[material-symbols--check-circle-outline-rounded] text-success', label: 'Up to date' },
  incomplete: { icon: 'icon-[material-symbols--warning-outline-rounded] text-warning', label: 'Some files not uploaded, retried next sync' },
  failed: { icon: 'icon-[material-symbols--error-outline-rounded] text-error', label: 'Failed, retried next sync' },
}

function fileSummary(files: NonNullable<CourseSyncReport['files']>) {
  const problems = [
    [files.unsupported, 'of a type or size not read'],
    [files.notDownloaded, 'not downloaded from Moodle'],
    [files.refused, 'refused by InNoHassle'],
    [files.notUploaded, 'not uploaded'],
  ].filter(([n]) => n as number > 0).map(([n, why]) => `${n} ${why}`)
  return `Files: ${files.sent} of ${files.listed} sent${problems.length ? `; ${problems.join(', ')}` : ''}`
}

function DataReport({ part }: { part: DataSyncReport }) {
  const incomplete = part.failed || (part.expected !== undefined && part.answered !== undefined && part.answered < part.expected)
  let detail = `${part.items} sent`
  if (part.failed)
    detail = 'Moodle did not answer; the old data stays'
  else if (incomplete)
    detail = `${part.items} sent; Moodle answered for ${part.answered} of ${part.expected} courses, the others keep their old data`
  return (
    <li className="flex items-start gap-1.5">
      <span
        className={cn(
          incomplete
            ? 'icon-[material-symbols--warning-outline-rounded] text-warning'
            : 'icon-[material-symbols--check-circle-outline-rounded] text-success',
          'mt-0.5 shrink-0 text-sm',
        )}
      />
      <div className="min-w-0">
        <span className="font-medium">{part.label}</span>
        <span className="text-base-content/50">{`: ${detail}`}</span>
      </div>
    </li>
  )
}

function CourseReports({ data, courses }: { data: DataSyncReport[], courses: CourseSyncReport[] }) {
  const sent = courses.filter(c => c.state === 'sent' || c.state === 'unchanged').length
  return (
    <details className="ml-6 text-xs">
      <summary className="cursor-pointer text-base-content/60">{`Details: ${sent} of ${courses.length} courses synced`}</summary>
      <ul className="mt-1 flex flex-col gap-1.5 border-b border-base-300 pb-1.5">
        {data.map(part => <DataReport key={part.label} part={part} />)}
      </ul>
      <ul className="mt-1.5 flex flex-col gap-1.5">
        {courses.map((c) => {
          const state = COURSE_STATE[c.state] ?? COURSE_STATE.waiting
          return (
            <li key={c.id} className="flex items-start gap-1.5">
              <span className={cn(state.icon, 'mt-0.5 shrink-0 text-sm')} />
              <div className="min-w-0">
                <div className="truncate font-medium" title={c.name}>{c.name}</div>
                <div className="text-base-content/50">{c.note ?? state.label}</div>
                {c.files && c.files.listed > 0 && <div className="text-base-content/50">{fileSummary(c.files)}</div>}
              </div>
            </li>
          )
        })}
      </ul>
    </details>
  )
}

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
  const report = useStorage('moodleSyncReport')
  const calendarLastSuccessMS = useStorage('calendarSyncLastSuccessMS')
  const calendarError = useStorage('calendarSyncLastError')
  const calendarStartedMS = useStorage('calendarSyncStartedMS')

  return (
    <div className={cn('flex flex-col gap-2', increased ? 'px-5 py-4' : 'border-t border-base-300 px-4 py-2.5')}>
      <StatusRow label="Calendar → InNoHassle" lastSuccessMS={calendarLastSuccessMS} error={calendarError} startedMS={calendarStartedMS} />
      {dataEnabled && (
        <StatusRow label="Moodle data → InNoHassle search" lastSuccessMS={dataLastSuccessMS} error={dataError} startedMS={dataStartedMS} />
      )}
      {dataEnabled && report && report.courses.length > 0 && <CourseReports data={report.data ?? []} courses={report.courses} />}
    </div>
  )
}
