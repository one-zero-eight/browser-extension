import type { ReactNode } from 'react'
import type { CoursesScope } from './useCourses'
import { useCourses } from './useCourses'
import { useMoodleSignedIn } from './useMoodleSignedIn'
import { CoursesScopeToggle } from '@/features/courses/CoursesScopeToggle'
import { DownloadCourseButton } from '@/features/download-course/DownloadCourseButton'
import { MOODLE_DASHBOARD_URL, MOODLE_GRADES_URL } from '@/shared/config/moodle'

export function CoursesList({ scope, onScopeChange }: {
  scope: CoursesScope
  onScopeChange: (scope: CoursesScope) => void
}) {
  const { courses, status, retry } = useCourses(scope)
  const signedIn = useMoodleSignedIn()

  if (signedIn === false) {
    return (
      <section className="px-4 pt-3">
        <SectionHeader />
        <div className="flex items-center gap-3 rounded-box bg-base-200 p-3">
          <span className="icon-[material-symbols--school-outline-rounded] text-2xl text-base-content/50" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">Connect Moodle</div>
            <div className="text-xs text-base-content/50">See courses and download files</div>
          </div>
          <a
            href={MOODLE_DASHBOARD_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="btn btn-primary btn-sm"
          >
            Sign in
          </a>
        </div>
      </section>
    )
  }

  let body: ReactNode
  if (courses && courses.length > 0) {
    body = courses.map(course => (
      <div key={course.id} className="flex items-center gap-0.5 border-t border-base-300 py-1 pr-1.5 pl-3 first:border-t-0">
        <a
          href={course.url}
          target="_blank"
          rel="noreferrer noopener"
          title={course.fullname}
          className="min-w-0 flex-1 truncate text-sm text-base-content no-underline hover:text-primary"
        >
          {course.fullname}
        </a>
        <a
          href={MOODLE_GRADES_URL(course.id)}
          target="_blank"
          rel="noreferrer noopener"
          title="Grades"
          aria-label={`Open grades for ${course.fullname}`}
          className="btn btn-ghost btn-square btn-sm"
        >
          <span className="icon-[material-symbols--menu-book-outline-rounded] text-lg text-base-content/50" />
        </a>
        <DownloadCourseButton courseId={course.id} courseName={course.fullname} />
      </div>
    ))
  }
  else if (status === 'loading') {
    body = (
      <div className="flex items-center gap-2 px-3 py-3 text-sm text-base-content/50">
        <span className="icon-[material-symbols--progress-activity] animate-spin text-lg" />
        Loading courses…
      </div>
    )
  }
  else if (status === 'error') {
    body = (
      <div className="flex items-center gap-2 px-3 py-2.5 text-sm">
        <span className="icon-[material-symbols--error-outline-rounded] shrink-0 text-lg text-error" />
        <span className="min-w-0 flex-1">Couldn’t load courses.</span>
        <button type="button" onClick={retry} className="btn btn-outline btn-sm">
          Retry
        </button>
      </div>
    )
  }
  else {
    body = <div className="px-3 py-3 text-sm text-base-content/50">No courses found.</div>
  }

  return (
    <section className="px-4 pt-3">
      <SectionHeader>
        <CoursesScopeToggle scope={scope} onChange={onScopeChange} />
      </SectionHeader>
      <div className="overflow-hidden rounded-box bg-base-200">{body}</div>
    </section>
  )
}

function SectionHeader({ children }: { children?: ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <h2 className="m-0 text-xs font-semibold tracking-wide text-base-content/50 uppercase">Moodle courses</h2>
      {children}
    </div>
  )
}
