import {
  injectSessionKeepalive,
  redirectFromLogin,
  refreshPageOnAutologin,
  requestAutologinIfNeeded,
  showAutologinNotification,
} from '@/features/autologin/content-script'
import { MOODLE_LOGIN_URL } from '@/shared/config/moodle'
import { onMessage, sendMessage } from '@/shared/messages'

onMessage('AUTOLOGIN_SUCCEEDED', () => {
  console.log(`Message AUTOLOGIN_SUCCEEDED received`)
  showAutologinNotification()
  refreshPageOnAutologin()
})

onMessage('AUTOLOGIN_FAILED', () => {
  console.log(`Message AUTOLOGIN_FAILED received`)
  if (window.location.href.startsWith(MOODLE_LOGIN_URL)) {
    redirectFromLogin(true)
  }
})

onMessage('AUTOLOGIN_LAST_SUCCESS', (autologinLastSuccessMS) => {
  console.log(`Message AUTOLOGIN_LAST_SUCCESS received (${autologinLastSuccessMS}, ${Date.now() - (autologinLastSuccessMS ?? 0)})`)
  if (autologinLastSuccessMS && Date.now() - autologinLastSuccessMS < 5 * 1000) { // less than 5 seconds ago
    showAutologinNotification()
  }
})

function main() {
  sendMessage('MOODLE_LOAD')
  requestAutologinIfNeeded()
  injectSessionKeepalive()
}

main()
