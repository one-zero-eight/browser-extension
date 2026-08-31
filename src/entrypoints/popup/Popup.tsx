import { useEffect, useState } from 'react'
import type { CoursesScope } from '@/features/courses/useCourses'
import { TopBar } from '@/entrypoints/popup/TopBar'
import { AutologinToggle } from '@/features/autologin/AutologinToggle'
import { CoursesList } from '@/features/courses/CoursesList'
import { SearchField } from '@/features/search/SearchField'
import { UsefulLinksSection } from '@/features/useful-links/UsefulLinksSection'
import { sendMessage } from '@/shared/messages'

export default function Popup() {
  const [coursesScope, setCoursesScope] = useState<CoursesScope>('inprogress')

  useEffect(() => {
    sendMessage('POPUP_OPEN')
  }, [])

  return (
    <div className="flex flex-col pb-3">
      <TopBar />
      <SearchField />
      <UsefulLinksSection />
      <CoursesList scope={coursesScope} onScopeChange={setCoursesScope} />
      <div className="mt-3">
        <AutologinToggle />
      </div>
    </div>
  )
}
