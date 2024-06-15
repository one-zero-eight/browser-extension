import { useEffect } from 'react'
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
      <CoursesList />
    </div>
  )
}
