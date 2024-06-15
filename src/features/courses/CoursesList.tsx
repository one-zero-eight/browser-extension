import { MOODLE_GRADES_URL } from '@/shared/config/moodle'
import { useStorage } from '@/shared/storage'

export function CoursesList() {
  const courses = useStorage('courses')

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="text-xl text-moodle font-bold">Your courses</div>
      <div>
        {courses?.map(v => (
          <div key={v.id} className="flex justify-between">
            <a href={v.viewurl} target="_blank" className="line-clamp-1 text-sm underline-offset-2 hover:underline">
              {v.fullname}
            </a>
            <div className="flex">
              <a href={MOODLE_GRADES_URL(v.id)} target="_blank" className="i-material-symbols-percent text-lg" />
            </div>
          </div>
        )) ?? <div className="text-lg">Loading...</div>}
      </div>
    </div>
  )
}
