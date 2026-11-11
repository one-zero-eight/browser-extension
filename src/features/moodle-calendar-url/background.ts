import { events } from '@/shared/innohassle-api/events'
import { moodle } from '@/shared/moodle-ws-api'
import { getStored, setStored } from '@/shared/storage'

async function succeed() {
  await setStored('calendarSyncLastSuccessMS', Date.now())
  await setStored('calendarSyncLastError', undefined)
  return true
}

async function fail(message: string) {
  await setStored('calendarSyncLastError', message)
  return false
}

/**
 * Connects the user's Moodle calendar to their InNoHassle calendar and records the outcome in storage
 * (`calendarSyncLastSuccessMS` / `calendarSyncLastError`) so the UI can show it.
 * Resolves to `true` when the calendar is connected (now or already), `false` otherwise.
 */
export async function syncMoodleCalendarUrl() {
  console.log('Syncing Moodle calendar URL...')

  const userId = await getStored('userId')
  if (!userId) {
    console.log('Warning: No user ID found')
    return fail('Sign in to Moodle once so the extension can read it')
  }

  await setStored('calendarSyncStartedMS', Date.now())

  try {
    const user = await events.usersGetMe()
    if (!user) {
      console.log('Warning: No InNoHassle user found')
      return fail('Sign in to InNoHassle')
    }

    if (user.moodle_userid === userId) {
      console.log('Moodle userid is already connected with InNoHassle')
      return succeed()
    }

    const siteInfo = await moodle.core.webservice.getSiteInfo({})
    if (user.email !== siteInfo.username) {
      console.log('Moodle account does not match InNoHassle account')
      return fail('Your Moodle account is not the one of your InNoHassle account')
    }

    const { token } = await moodle.core.calendar.getCalendarExportToken({})
    if (!token) {
      console.log('Error: No Moodle calendar token found')
      return fail('Moodle did not return a calendar token')
    }

    await events.usersSetUserMoodleData({
      moodle_userid: userId,
      moodle_calendar_authtoken: token,
    })

    console.log('Moodle calendar URL have been synced successfully')
    return succeed()
  }
  catch (e) {
    console.warn('Moodle calendar sync failed', e)
    return fail(`Calendar sync failed: ${e instanceof Error ? e.message : String(e)}`)
  }
  finally {
    await setStored('calendarSyncStartedMS', undefined)
  }
}
