import type { CoursesScope } from './useCourses'
import { cn } from '@/shared/ui/utils'

const OPTIONS: { value: CoursesScope, label: string }[] = [
  { value: 'inprogress', label: 'Current' },
  { value: 'all', label: 'All' },
]

/** Popup-wide switch between in-progress courses and every enrolled course. */
export function CoursesScopeToggle({ scope, onChange }: {
  scope: CoursesScope
  onChange: (scope: CoursesScope) => void
}) {
  return (
    <div className="inline-flex rounded-field bg-base-300 p-0.5">
      {OPTIONS.map(option => (
        <button
          key={option.value}
          type="button"
          aria-pressed={scope === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-[0.4rem] border-0 px-2.5 py-1 text-xs leading-none transition-colors',
            scope === option.value
              ? 'bg-base-100 font-medium text-base-content'
              : 'bg-transparent text-base-content/50 hover:text-base-content',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
