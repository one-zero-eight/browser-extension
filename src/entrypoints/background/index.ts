import { applyUserAgentRule } from '@/entrypoints/background/net-rules'
import { fetchCourses } from '@/features/courses/background'
import { onMessage } from '@/shared/messages'

chrome.runtime.onInstalled.addListener(() => {
  applyUserAgentRule()
})

onMessage('POPUP_OPEN', () => {
  console.log('Background has received a message POPUP_OPEN')
  fetchCourses()
})
