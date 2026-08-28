import { useEffect, useState } from 'react'
import type { CoursesScope } from '@/features/courses/useCourses'
import { TopBar } from '@/entrypoints/popup/TopBar'
import { AutologinToggle } from '@/features/autologin/AutologinToggle'
import { CoursesList } from '@/features/courses/CoursesList'
import { CoursesScopeToggle } from '@/features/courses/CoursesScopeToggle'
import { SearchField } from '@/features/search/SearchField'
import { UsefulLinksSection } from '@/features/useful-links/UsefulLinksSection'
import { sendMessage } from '@/shared/messages'

export default function Popup() {
  const [coursesScope, setCoursesScope] = useState<CoursesScope>('inprogress')

  useEffect(() => {
    sendMessage('POPUP_OPEN')
  }, [])

  return (
    <div className="min-w-md flex flex-col">
      <TopBar />
      <div className="flex items-center justify-end border-b border-gray-800 px-2 py-1">
        <CoursesScopeToggle scope={coursesScope} onChange={setCoursesScope} />
      </div>
      <UsefulLinksSection />
      <SearchField />
      <CoursesList scope={coursesScope} />
      <AutologinToggle />
    </div>
  )
}
