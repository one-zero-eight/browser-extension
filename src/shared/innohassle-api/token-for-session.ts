import axios from 'axios'
import { INNOHASSLE_ACCOUNTS_TOKEN_URL } from '@/shared/config/innohassle'

/**
 * Request token for InNoHassle APIs.
 */
export async function obtainToken(): Promise<{
  token?: string
}> {
  console.debug('Requesting token for InNoHassle API...')
  try {
    // Request token for mobile app
    const resp = await axios({
      url: INNOHASSLE_ACCOUNTS_TOKEN_URL,
      withCredentials: true, // Include cookies
    })

    const access_token = resp.data.access_token

    if (typeof access_token !== 'string') {
      throw new TypeError('No token present in response')
    }

    return { token: access_token }
  }
  catch (e) {
    console.log('Warning: Couldn\'t get InNoHassle token')
  }
  return {}
}
