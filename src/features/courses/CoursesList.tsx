import type { ReactNode } from 'react'
import type { CoursesScope } from './useCourses'
import { useCourses } from './useCourses'
import { CoursesScopeToggle } from '@/features/courses/CoursesScopeToggle'
import { DownloadCourseButton } from '@/features/download-course/DownloadCourseButton'
import { MOODLE_GRADES_URL } from '@/shared/config/moodle'

export function CoursesList({ scope, onScopeChange }: {
  scope: CoursesScope
  onScopeChange: (scope: CoursesScope) => void
}) {
  const { courses, status, retry } = useCourses(scope)

  let body: ReactNode
  if (courses && courses.length > 0) {
    body = courses.map(course => (
      <div key={course.id} className="flex items-center justify-between gap-2">
        <a
          href={course.url}
          target="_blank"
          className="line-clamp-1 text-sm underline-offset-2 hover:underline"
        >
          {course.fullname}
        </a>
        <div className="flex shrink-0 items-center gap-2">
          <a
            href={MOODLE_GRADES_URL(course.id)}
            target="_blank"
            className="i-material-symbols-menu-book-outline-rounded text-lg"
            title="Grades"
          />
          <DownloadCourseButton courseId={course.id} courseName={course.fullname} />
        </div>
      </div>
    ))
  }
  else if (status === 'loading') {
    body = <div className="text-sm text-gray-500">Loading...</div>
  }
  else if (status === 'error') {
    body = (
      <div className="flex items-center gap-2 text-sm text-red-400">
        <span>Couldn’t load courses.</span>
        <button
          type="button"
          onClick={retry}
          className="rounded bg-[#9747FF] px-2 py-1 text-xs hover:bg-[#6600CC]"
        >
          Retry
        </button>
      </div>
    )
  }
  else {
    body = <div className="text-sm text-gray-500">No courses found.</div>
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xl text-moodle font-bold">Your courses</div>
        <CoursesScopeToggle scope={scope} onChange={onScopeChange} />
      </div>
      <div className="flex flex-col gap-1">{body}</div>
    </div>
  )
}
