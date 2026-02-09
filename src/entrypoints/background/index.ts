import { applyUserAgentRule } from '@/entrypoints/background/net-rules'
import { autoLogIn } from '@/features/autologin/background'
import { fetchCourses } from '@/features/courses/background'
import { syncMoodleCalendarUrl } from '@/features/moodle-calendar-url/background'
import { onMessage, sendMessageToMoodleTabs } from '@/shared/messages'
import { refreshToken } from '@/shared/moodle-ws-api/token-store'
import { getStored, setStored } from '@/shared/storage'
import { initializeUsefulLinksIfNeeded } from '@/features/useful-links/background'

chrome.runtime.onInstalled.addListener(() => {
  applyUserAgentRule()
})

onMessage('POPUP_OPEN', () => {
  console.log('Background has received a message POPUP_OPEN')
  fetchCourses()
  syncMoodleCalendarUrl()
  initializeUsefulLinksIfNeeded()
})

onMessage('MOODLE_LOAD', () => {
  console.log('Background has received a message MOODLE_LOAD')
  // Initialize variables in the storage
  getStored('autologinEnabled').then((stored) => {
    if (stored === undefined) {
      setStored('autologinEnabled', true)
    }
  })
  getStored('autologinLastSuccessMS').then((autologinLastSuccessMS) => {
    sendMessageToMoodleTabs('AUTOLOGIN_LAST_SUCCESS', autologinLastSuccessMS)
  })

  getStored('privateToken').then((privateToken) => {
    if (!privateToken) {
      // Try to get token and privateToken from current session
      refreshToken()
    }
    else {
      getStored('userId').then((userId) => {
        if (!userId) {
          // Try to get userId from current session
          refreshToken()
        }
        else {
          // Sync the calendar url if needed
          syncMoodleCalendarUrl()
        }
      })
    }
  })
})

onMessage('REQUEST_AUTOLOGIN', () => {
  console.log('Background has received a message REQUEST_AUTOLOGIN')
  autoLogIn().then((success) => {
    // Send message to all content scripts
    sendMessageToMoodleTabs(success ? 'AUTOLOGIN_SUCCEEDED' : 'AUTOLOGIN_FAILED')
  })
})
