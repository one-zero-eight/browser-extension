import {
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

function main() {
  sendMessage('MOODLE_LOAD')
  requestAutologinIfNeeded()
}

main()
