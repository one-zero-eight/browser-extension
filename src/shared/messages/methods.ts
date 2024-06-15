import type { Messages } from './types'

export function sendMessage<T extends keyof Messages>(type: T, data: Messages[T] = undefined) {
  chrome.runtime.sendMessage({ type, data })
}

export function onMessage<T extends keyof Messages>(type: T, callback: (data: Messages[T]) => void) {
  chrome.runtime.onMessage.addListener((request) => {
    if (request.type === type) {
      callback(request.data)
    }
  })
}
