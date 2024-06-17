import { obtainMobileToken } from './token-for-session'
import { moodle } from '@/shared/moodle-ws-api/client'
import { getStored, removeStored, setStored } from '@/shared/storage'

/**
 * Get token for accessing Moodle Web service API.
 * Obtain a new token if we don't have a valid one.
 */
export async function getToken(): Promise<string | undefined> {
  const storedToken = await getStored('token')
  if (storedToken) {
    return storedToken
  }

  return await refreshToken()
}

/**
 * Remove token from storage.
 */
export async function invalidateToken() {
  await removeStored('token')
  await removeStored('privateToken')
}

/**
 * Obtain a new token and store it.
 */
export async function refreshToken() {
  const { token, privateToken } = await obtainMobileToken()
  if (token) {
    await setStored('token', token)
    await setStored('privateToken', privateToken)
    moodle.core.webservice.getSiteInfo({}).then((siteInfo) => {
      setStored('userId', siteInfo.userid)
    })
  }
  return token
}
