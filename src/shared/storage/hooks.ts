import { useEffect, useState } from 'react'
import { getStored } from './methods'
import type { SharedStorage } from './types'
import StorageChange = chrome.storage.StorageChange

export function useStorage<K extends keyof SharedStorage>(key: K): SharedStorage[K] | undefined {
  const [data, setData] = useState<SharedStorage[K]>()

  useEffect(() => {
    // Update data from storage initially
    getStored(key).then(res => setData(res))

    // Listen for changes in storage
    const callback = (changes: { [key: string]: StorageChange }): void => {
      if (key in changes) {
        setData(changes[key].newValue as SharedStorage[K])
      }
    }
    chrome.storage.local.onChanged.addListener(callback)
    return () => chrome.storage.local.onChanged.removeListener(callback)
  }, [key])

  return data
}
