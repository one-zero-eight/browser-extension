import { useEffect } from 'react'
import type { Messages } from './types'

export function useListenMessage<T extends keyof Messages>(type: T, callback: (data: Messages[T]) => void) {
  useEffect(() => {
    // Listen for messages of the given type
    const callback = (message: any) => {
      if (message.type === type) {
        callback(message.data)
      }
    }
    chrome.runtime.onMessage.addListener(callback)
    return () => chrome.runtime.onMessage.removeListener(callback)
  }, [type, callback])
}
