import { events } from '@/shared/innohassle-api/events'
import { moodle } from '@/shared/moodle-ws-api'
import { getStored } from '@/shared/storage'

export async function syncMoodleCalendarUrl() {
  console.log('Syncing Moodle calendar URL...')

  const userId = await getStored('userId')
  if (!userId) {
    console.log('Warning: No user ID found')
    return false
  }

  const user = await events.usersGetMe()
  if (!user) {
    console.log('Warning: No InNoHassle user found')
    return false
  }

  if (user.moodle_userid === userId) {
    console.log('Moodle userid is already connected with InNoHassle')
    return false
  }

  const siteInfo = await moodle.core.webservice.getSiteInfo({})
  if (user.email !== siteInfo.username) {
    console.log('Moodle account does not match InNoHassle account')
    return false
  }

  try {
    const { token } = await moodle.core.calendar.getCalendarExportToken({})
    if (!token) {
      console.log('Error: No Moodle calendar token found')
      return false
    }

    await events.usersSetUserMoodleData({
      moodle_userid: userId,
      moodle_calendar_authtoken: token,
    })

    console.log('Moodle calendar URL have been synced successfully')
  }
  catch (e) {
    console.log('Error: Couldn\'t get Moodle calendar token')
  }
}
