import {
  redirectFromLogin,
  refreshPageOnAutologin,
  requestAutologinIfNeeded,
} from '@/features/autologin/content-script'
import { MOODLE_LOGIN_URL } from '@/shared/config/moodle'
import { onMessage, sendMessage } from '@/shared/messages'

onMessage('AUTOLOGIN_SUCCEEDED', () => {
  console.log(`Message AUTOLOGIN_SUCCEEDED received`)
  refreshPageOnAutologin()
})

onMessage('AUTOLOGIN_FAILED', () => {
  console.log(`Message AUTOLOGIN_FAILED received`)
  if (window.location.href === MOODLE_LOGIN_URL) {
    redirectFromLogin(true)
  }
})

function main() {
  sendMessage('MOODLE_LOAD')
  requestAutologinIfNeeded()
}

main()
