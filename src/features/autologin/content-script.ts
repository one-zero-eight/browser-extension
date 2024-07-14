import { MOODLE_DASHBOARD_URL, MOODLE_LOGIN_URL, MOODLE_MOBILE_LAUNCH_URL } from '@/shared/config/moodle'
import { sendMessage } from '@/shared/messages'

export function requestAutologinIfNeeded() {
  if (window.location.href.startsWith(MOODLE_LOGIN_URL)) {
    sendMessage('REQUEST_AUTOLOGIN')
  }
  else if (window.location.href.startsWith(MOODLE_MOBILE_LAUNCH_URL)) {
    window.location.href = MOODLE_DASHBOARD_URL
  }
  else if (document.body.classList.contains('notloggedin')) {
    sendMessage('REQUEST_AUTOLOGIN')
  }
}

export function refreshPageOnAutologin() {
  if (window.location.href.startsWith(MOODLE_LOGIN_URL)) {
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

export function showAutologinNotification() {
  const notification = document.createElement('div')
  notification.textContent = 'Autologin successful! By InNoHassle Tools'
  notification.style.cssText = `
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    padding-left: 1rem;
    padding-right: 1rem;
    border-radius: 1rem;
    z-index: 9999;
    background-color: #9747ff;
    font-size: 1rem;
    font-weight: bold;
    color: white;
    text-align: center;
  `

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.remove()
  }, 2000)
}

export function injectSessionKeepalive() {
  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.src = chrome.runtime.getURL('src/features/autologin/session-keepalive.js')
  document.body.appendChild(script)
}
