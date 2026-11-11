import axios from 'axios'
import { deleteMoodleData, putMoodleCourseContent, putMoodleOverview } from './api'
import { collectCourseContent, collectOverview } from './collect'
import { getStored, setStored } from '@/shared/storage'

const SYNC_EVERY_MS = 6 * 60 * 60 * 1000

let syncInProgress: Promise<boolean> | null = null

/**
 * Sends the user's Moodle data to InNoHassle when the user turned it on. The alarm, a Moodle page load, the popup
 * and the toggle may ask at once, so concurrent calls share one run. Without `force`, a sync is skipped
 * when the last successful one is younger than 6 hours.
 */
export function syncMoodleData(force = false) {
  if (!syncInProgress) {
    syncInProgress = doSync(force).finally(() => {
      syncInProgress = null
    })
  }
  return syncInProgress
}

async function sha256Hex(text: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('')
}

async function doSync(force: boolean) {
  if (await getStored('moodleSyncEnabled') !== true) {
    return false
  }
  if (!force && Date.now() - ((await getStored('moodleSyncLastSuccessMS')) ?? 0) < SYNC_EVERY_MS) {
    return true
  }
  // A background run never starts a Moodle token flow itself
  if (!(await getStored('token'))) {
    await setStored('moodleSyncLastError', 'Sign in to Moodle once so the extension can read it')
    return false
  }

  try {
    const { overview, contentCourseIds } = await collectOverview()
    const { courses_without_content } = await putMoodleOverview(overview)

    const hashes = { ...(await getStored('moodleSyncContentHashes')) }
    for (const id of contentCourseIds) {
      try {
        const body = await collectCourseContent(id)
        const hash = await sha256Hex(JSON.stringify(body))
        if (hash !== hashes[id] || courses_without_content.includes(id)) {
          await putMoodleCourseContent(id, body)
          hashes[id] = hash
        }
      }
      catch (e) {
        // This course keeps its old hash, so it is retried next time
        console.warn(`Moodle sync: content of course ${id} failed`, e)
      }
    }
    const enrolled = new Set(overview.courses.map(c => String(c.course_id)))
    for (const id of Object.keys(hashes)) {
      if (!enrolled.has(id))
        delete hashes[id]
    }

    await setStored('moodleSyncContentHashes', hashes)
    await setStored('moodleSyncLastSuccessMS', Date.now())
    await setStored('moodleSyncLastError', undefined)
    return true
  }
  catch (e) {
    console.warn('Moodle sync failed', e)
    if (axios.isAxiosError(e) && e.response?.status === 409) {
      await setStored('moodleSyncLastError', 'Your Moodle account is not the one of your InNoHassle account')
    }
    else {
      await setStored('moodleSyncLastError', `Sync failed: ${e instanceof Error ? e.message : String(e)}`)
    }
    return false
  }
}

/** Turns the sync off and deletes the user's Moodle data from InNoHassle. */
export async function disableMoodleSync() {
  await setStored('moodleSyncEnabled', false)
  try {
    await deleteMoodleData()
  }
  catch (e) {
    console.warn('Moodle sync: deleting the data failed', e)
    await setStored('moodleSyncLastError', 'Could not delete your Moodle data from InNoHassle; try again')
    return false
  }
  await setStored('moodleSyncContentHashes', undefined)
  await setStored('moodleSyncLastSuccessMS', undefined)
  await setStored('moodleSyncLastError', undefined)
  return true
}
