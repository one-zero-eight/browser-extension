import { useCallback, useEffect, useState } from 'react'
import { fetchAllCourses, fetchCourses } from './background'
import { MOODLE_COURSE_URL } from '@/shared/config/moodle'
import { useStorage } from '@/shared/storage'

export type CoursesScope = 'inprogress' | 'all'
export type CoursesStatus = 'loading' | 'ready' | 'error'

/** Normalized course shape used by the popup, regardless of which WS it came from. */
export interface CourseItem {
  id: number
  fullname: string
  url: string
}

/**
 * Read the courses for the given scope from storage and keep them fresh.
 *
 * `inprogress` uses the dashboard classification WS (already has `viewurl`),
 * `all` uses `core_enrol_get_users_courses` (URL is built from the id).
 */
export function useCourses(scope: CoursesScope) {
  const [status, setStatus] = useState<CoursesStatus>('loading')
  const inProgressCourses = useStorage('courses')
  const allCourses = useStorage('allCourses')

  const load = useCallback((force = false) => {
    setStatus('loading')
    const fetcher = scope === 'all' ? fetchAllCourses : fetchCourses
    return fetcher(force).then((ok) => {
      setStatus(ok ? 'ready' : 'error')
      return ok
    })
  }, [scope])

  useEffect(() => {
    load()
  }, [load])

  const courses: CourseItem[] | undefined = scope === 'all'
    ? allCourses?.map(c => ({ id: c.id, fullname: c.fullname, url: MOODLE_COURSE_URL(c.id) }))
    : inProgressCourses?.map(c => ({ id: c.id, fullname: c.fullname, url: c.viewurl }))

  return { courses, status, retry: () => load(true) }
}
