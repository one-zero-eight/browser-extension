import axios from 'axios'
import { MOODLE_MOBILE_LAUNCH_URL } from '@/shared/config/moodle'

/**
 * Flow to receive token for Moodle Web service API.
 * It also tries to receive privateToken if SSO session is active.
 * The token will be used to access Moodle Web service API.
 * The private token will be used to get autologin key.
 */
export async function obtainMobileToken(options: { useSSO?: boolean } = { useSSO: true }): Promise<{
  token?: string
  privateToken?: string
}> {
  console.debug('Requesting token for Moodle Web service API...')
  try {
    // Request token for mobile app
    const resp = await axios({
      url: MOODLE_MOBILE_LAUNCH_URL,
      maxRedirects: 2, // launch.php => login.php => launch.php !=> moodlemobile
      params: {
        service: 'moodle_mobile_app',
        passport: 1,
        confirmed: true, // Do not redirect to moodlemobile automatically
        oauthsso: options.useSSO ? 1 : 0, // Required for receiving privateToken
      },
      fetchOptions: {
        mode: 'no-cors',
      },
    })

    // Extract token from html page
    const encodedToken = resp.data.match(/"moodlemobile:\/\/token=(.*)"/)?.[1]
    if (!encodedToken) {
      throw new Error('No token present on page')
    }

    // Split token into siteId, token, privateToken
    const plainToken = atob(encodedToken)
    const [_, token, privateToken] = plainToken.split(':::') as [string, string, string | undefined]

    if (token === undefined) {
      console.log('Warning: Couldn\'t get mobile_app token')
    }
    else if (privateToken === undefined) {
      console.log('Warning: Got token, but no privateToken')
    }
    else {
      console.log('Got token and privateToken')
    }

    return { token, privateToken }
  }
  catch (e) {
    console.log('Warning: Couldn\'t get mobile_app token')
    if (options.useSSO) {
      console.log('Warning: Trying without SSO...')
      return await obtainMobileToken({ useSSO: false })
    }
  }
  return {}
}
