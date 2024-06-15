import type { SharedStorage } from './types'

export async function getStored<K extends keyof SharedStorage>(key: K): Promise<SharedStorage[K] | undefined> {
  const res = await chrome.storage.local.get(key)
  return res[key] as SharedStorage[K] | undefined
}

export async function setStored<K extends keyof SharedStorage>(key: K, value: SharedStorage[K] | undefined) {
  if (value !== undefined) {
    await chrome.storage.local.set({ [key]: value })
  }
  else {
    await removeStored(key)
  }
}

export async function removeStored<K extends keyof SharedStorage>(key: K) {
  await chrome.storage.local.remove(key)
}
