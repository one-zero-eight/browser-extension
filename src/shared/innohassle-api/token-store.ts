import { obtainToken } from './token-for-session'
import { getStored, removeStored, setStored } from '@/shared/storage'

/**
 * Get token for accessing InNoHassle APIs.
 * Obtain a new token if we don't have a valid one.
 */
export async function getToken(): Promise<string | undefined> {
  const storedToken = await getStored('innohassleToken')
  if (storedToken) {
    return storedToken
  }

  return await refreshToken()
}

/**
 * Remove token from storage.
 */
export async function invalidateToken() {
  await removeStored('innohassleToken')
}

/**
 * Obtain a new token and store it.
 */
export async function refreshToken() {
  const { token } = await obtainToken()
  if (token) {
    await setStored('innohassleToken', token)
  }
  return token
}
