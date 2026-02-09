import { useEffect } from 'react'
import { AutologinToggle } from '@/features/autologin/AutologinToggle'
import { SearchField } from '@/features/search/SearchField'
import { UsefulLinksSection } from '@/features/useful-links/UsefulLinksSection'
import { TopBar } from '@/entrypoints/popup/TopBar'
import { CoursesList } from '@/features/courses/CoursesList'
import { sendMessage } from '@/shared/messages'

export default function Popup() {
  useEffect(() => {
    sendMessage('POPUP_OPEN')
  }, [])

  return (
    <div className="min-w-md flex flex-col">
      <TopBar />
      <UsefulLinksSection />
      <SearchField />
      <CoursesList />
      <AutologinToggle />
    </div>
  )
}
