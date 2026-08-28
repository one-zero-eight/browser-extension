import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { DownloadCourseButton } from './DownloadCourseButton'
import { fetchAllCourses, fetchCourses } from '@/features/courses/background'
import { useStorage } from '@/shared/storage'
import { cn } from '@/shared/ui/utils'

type Scope = 'inprogress' | 'all'
type Status = 'loading' | 'ready' | 'error'

const SCOPES = [
  { value: 'inprogress', label: 'In progress', empty: 'No courses in progress.' },
  { value: 'all', label: 'All courses', empty: 'No enrolled courses found.' },
] as const

function CourseRows({ courses }: { courses: readonly { id: number, fullname: string }[] }) {
  return (
    <>
      {courses.map(course => (
        <div key={course.id} className="flex items-center justify-between gap-2">
          <span className="line-clamp-1 text-sm" title={course.fullname}>
            {course.fullname}
          </span>
          <DownloadCourseButton courseId={course.id} courseName={course.fullname} />
        </div>
      ))}
    </>
  )
}

export function DownloadCoursesSection() {
  const [scope, setScope] = useState<Scope>('inprogress')
  const [status, setStatus] = useState<Status>('loading')
  const inProgressCourses = useStorage('courses')
  const allCourses = useStorage('allCourses')

  const meta = SCOPES.find(s => s.value === scope)!
  const courses = scope === 'all' ? allCourses : inProgressCourses

  function load(force = false) {
    setStatus('loading')
    const fetcher = scope === 'all' ? fetchAllCourses : fetchCourses
    return fetcher(force)
  }

  useEffect(() => {
    let active = true
    load().then(ok => active && setStatus(ok ? 'ready' : 'error'))
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope])

  let body: ReactNode
  if (courses && courses.length > 0) {
    body = <CourseRows courses={courses} />
  }
  else if (status === 'loading') {
    body = <div className="text-sm text-gray-500">Loading…</div>
  }
  else if (status === 'error') {
    body = (
      <div className="flex items-center gap-2 text-sm text-red-400">
        <span>Couldn’t load courses.</span>
        <button
          type="button"
          onClick={() => load(true).then(ok => setStatus(ok ? 'ready' : 'error'))}
          className="rounded bg-[#9747FF] px-2 py-1 text-xs hover:bg-[#6600CC]"
        >
          Retry
        </button>
      </div>
    )
  }
  else {
    body = <div className="text-sm text-gray-500">{meta.empty}</div>
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xl text-moodle font-bold">Download course content</div>
        <div className="flex overflow-hidden rounded-lg text-xs">
          {SCOPES.map(s => (
            <button
              key={s.value}
              type="button"
              onClick={() => setScope(s.value)}
              className={cn(
                'px-2 py-1',
                scope === s.value ? 'bg-[#9747FF]' : 'bg-gray-700 hover:bg-gray-600',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {body}
    </div>
  )
}
