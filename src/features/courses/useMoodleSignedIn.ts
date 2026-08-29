import { useEffect, useState } from 'react'
import { getStored } from '@/shared/storage'

/**
 * Whether the extension currently holds a Moodle Web Services token.
 *
 * Returns `undefined` while the initial storage read is in flight (so callers
 * can avoid flashing a "signed out" state on every popup open), then `true` /
 * `false`. Reacts to the token being written or cleared (e.g. after Moodle
 * rejects an expired token with `invalidtoken`).
 */
export function useMoodleSignedIn(): boolean | undefined {
  const [signedIn, setSignedIn] = useState<boolean>()

  useEffect(() => {
    getStored('token').then(token => setSignedIn(Boolean(token)))

    const callback = (changes: Record<string, chrome.storage.StorageChange>) => {
      if ('token' in changes)
        setSignedIn(Boolean(changes.token.newValue))
    }
    chrome.storage.local.onChanged.addListener(callback)
    return () => chrome.storage.local.onChanged.removeListener(callback)
  }, [])

  return signedIn
}
