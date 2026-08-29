import type { CoursesScope } from './useCourses'
import { cn } from '@/shared/ui/utils'

const OPTIONS: { value: CoursesScope, label: string }[] = [
  { value: 'inprogress', label: 'In progress' },
  { value: 'all', label: 'All courses' },
]

/** Popup-wide switch between in-progress courses and every enrolled course. */
export function CoursesScopeToggle({ scope, onChange }: {
  scope: CoursesScope
  onChange: (scope: CoursesScope) => void
}) {
  return (
    <div className="flex overflow-hidden rounded-lg text-xs">
      {OPTIONS.map(option => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'px-3 py-1',
            scope === option.value ? 'bg-[#9747FF]' : 'bg-gray-700 hover:bg-gray-600',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
