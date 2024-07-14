import { applyUserAgentRule } from '@/entrypoints/background/net-rules'
import { autoLogIn } from '@/features/autologin/background'
import { fetchCourses } from '@/features/courses/background'
import { syncCourses } from '@/features/search-sync/background'
import { onMessage, sendMessageToMoodleTabs } from '@/shared/messages'
import { refreshToken } from '@/shared/moodle-ws-api/token-store'
import { getStored } from '@/shared/storage'

chrome.runtime.onInstalled.addListener(() => {
  applyUserAgentRule()
})

onMessage('POPUP_OPEN', () => {
  console.log('Background has received a message POPUP_OPEN')
  fetchCourses()
  syncCourses()
})

onMessage('MOODLE_LOAD', () => {
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
          // Run the worker if needed
          syncCourses()
        }
      })
    }
  })
})

onMessage('REQUEST_AUTOLOGIN', () => {
  autoLogIn().then((success) => {
    // Send message to all content scripts
    sendMessageToMoodleTabs(success ? 'AUTOLOGIN_SUCCEEDED' : 'AUTOLOGIN_FAILED')
  })
})
