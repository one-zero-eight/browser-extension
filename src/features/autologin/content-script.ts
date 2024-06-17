import { MOODLE_LOGIN_URL } from '@/shared/config/moodle'
import { sendMessage } from '@/shared/messages'

export function requestAutologinIfNeeded() {
  if (window.location.href === MOODLE_LOGIN_URL) {
    sendMessage('REQUEST_AUTOLOGIN')
  }
}

export function refreshPageOnAutologin() {
  if (window.location.href === MOODLE_LOGIN_URL) {
    redirectFromLogin()
  }
  else {
    window.location.reload()
  }
}

export function redirectFromLogin(shouldGoToSSO: boolean = false) {
  const link = document.querySelector('a.btn.login-identityprovider-btn.btn-block')
  const href = link?.getAttribute('href')
  if (!href) {
    return
  }

  if (shouldGoToSSO) {
    console.log(`Redirecting to ${href}`)
    window.location.href = href
    return
  }

  const wantsUrl = new URL(href).searchParams.get('wantsurl')
  if (wantsUrl) {
    console.log(`Redirecting to ${wantsUrl}`)
    window.location.href = wantsUrl
    return
  }

  console.log(`No wantsurl parameter found. Redirecting to ${href}`)
  window.location.href = href
}
