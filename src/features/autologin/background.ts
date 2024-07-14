import axios from 'axios'
import { moodle } from '@/shared/moodle-ws-api'
import { getStored, setStored } from '@/shared/storage'

export async function autoLogIn() {
  const enabled = await getStored('autologinEnabled')
  if (enabled === false) {
    console.log('Auto login is disabled, skipping')
    return false
  }

  console.debug('Auto logging in...')
  const privateToken = await getStored('privateToken')
  if (!privateToken) {
    console.log('Warning: No private token found')
    return false
  }

  const userId = await getStored('userId')
  if (!userId) {
    console.log('Warning: No user ID found')
    return false
  }

  try {
    const { autologinurl, key } = await moodle.tool.mobile.getAutologinKey({ privatetoken: privateToken })

    const url = new URL(autologinurl)
    url.searchParams.append('userid', userId.toString())
    url.searchParams.append('key', key)
    // We are fetching in background, so urltogo is not needed
    // url.searchParams.append("urltogo", encodeURIComponent(`${MOODLE_URL}/my/`))

    await axios.get(url.toString())
    console.log('Auto login succeeded')
    await setStored('autologinLastSuccessMS', Date.now())
    return true
  }
  catch (e) {
    console.log('Warning: Auto login failed', e)
    return false
  }
}
