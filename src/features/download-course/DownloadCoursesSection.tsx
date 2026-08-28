import { DownloadCourseButton } from './DownloadCourseButton'
import { useStorage } from '@/shared/storage'

export function DownloadCoursesSection() {
  const courses = useStorage('courses')

  if (!courses)
    return null

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="text-xl text-moodle font-bold">Download course content</div>

      {courses.length === 0
        ? (
          <div className="text-sm text-gray-500">No active courses found.</div>
          )
        : (
            courses.map(course => (
              <div key={course.id} className="flex items-center justify-between gap-2">
                <span className="line-clamp-1 text-sm" title={course.fullname}>
                  {course.fullname}
                </span>
                <DownloadCourseButton courseId={course.id} courseName={course.fullname} />
              </div>
            ))
          )}
    </div>
  )
}
