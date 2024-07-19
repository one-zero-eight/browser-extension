import type { Messages } from './types'
import { MOODLE_URL } from '@/shared/config/moodle'

export function sendMessage<T extends keyof Messages>(type: T, data: Messages[T] | undefined = undefined) {
  chrome.runtime.sendMessage({ type, data }).then().catch(console.log)
}

export function sendMessageToMoodleTabs<T extends keyof Messages>(type: T, data: Messages[T] | undefined = undefined) {
  chrome.tabs.query(
    { url: `${MOODLE_URL}/*` },
    tabs =>
      tabs.forEach((tab) => {
        if (tab.id) {
          sendMessageToTab(tab.id, type, data)
        }
      }),
  )
}

export function sendMessageToTab<T extends keyof Messages>(tabId: number, type: T, data: Messages[T] | undefined = undefined) {
  chrome.tabs.sendMessage(tabId, { type, data }).then().catch(console.log)
}

export function onMessage<T extends keyof Messages>(type: T, callback: (data: Messages[T] | undefined) => void) {
  chrome.runtime.onMessage.addListener((request) => {
    if (request.type === type) {
      callback(request.data)
    }
  })
}
