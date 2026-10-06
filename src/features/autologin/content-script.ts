import {
  MOODLE_DASHBOARD_URL,
  MOODLE_LOGIN_URL,
  MOODLE_MOBILE_LAUNCH_URL,
  MOODLE_OAUTH2_LOGIN_URL,
  MOODLE_URL,
} from '@/shared/config/moodle'
import { sendMessage } from '@/shared/messages'
import { getStored, setStored } from '@/shared/storage'

export function requestAutologinIfNeeded() {
  getStored('autologinEnabled').then((enabled) => {
    if ((window.location.href.startsWith(MOODLE_LOGIN_URL) || window.location.href.startsWith(MOODLE_OAUTH2_LOGIN_URL)) && enabled) {
      sendMessage('REQUEST_AUTOLOGIN')
    }
    else if (window.location.href.startsWith(MOODLE_MOBILE_LAUNCH_URL)) {
      window.location.href = MOODLE_DASHBOARD_URL
    }
    else if (document.body.classList.contains('notloggedin') && enabled) {
      sendMessage('REQUEST_AUTOLOGIN')
    }
  })
}

export function refreshPageOnAutologin() {
  if (window.location.href.startsWith(MOODLE_LOGIN_URL) || window.location.href.startsWith(MOODLE_OAUTH2_LOGIN_URL)) {
    redirectFromLogin()
  }
  else {
    window.location.reload()
  }
}

export function redirectFromLogin(shouldGoToSSO: boolean = false) {
  // Don't depend on theme-specific classes like "btn-block", which newer Moodle versions replaced
  const link = document.querySelector('a.login-identityprovider-btn')
  const href = link?.getAttribute('href')

  if (shouldGoToSSO) {
    if (!href) {
      return
    }
    // Moodle may have remembered the mobile launch URL as wantsurl after our background token request.
    // Replace it, otherwise after SSO the user is redirected to "moodlemobile://".
    const ssoUrl = new URL(href, MOODLE_URL)
    ssoUrl.searchParams.set('wantsurl', getWantsUrl(href) ?? MOODLE_DASHBOARD_URL)
    console.log(`Redirecting to ${ssoUrl.href}`)
    setStored('autologinLastSuccessMS', Date.now())
    window.location.href = ssoUrl.href
    return
  }

  // On the oauth2 login page, wantsurl is in the page URL; on the login page, it is in the SSO button link
  const wantsUrl = getWantsUrl(window.location.href) ?? (href ? getWantsUrl(href) : null)
  const target = wantsUrl ?? MOODLE_DASHBOARD_URL
  console.log(`Redirecting to ${target}`)
  window.location.href = target
}

function getWantsUrl(url: string) {
  const wantsUrl = new URL(url, MOODLE_URL).searchParams.get('wantsurl')
  if (!wantsUrl) {
    return null
  }
  // wantsurl may be relative (e.g. "/"); only allow redirects within Moodle.
  // Skip mobile launch URL: Moodle may remember it as wantsurl after our background token request,
  // and opening it redirects to "moodlemobile://", which makes the browser ask to open an external app.
  const resolved = new URL(wantsUrl, MOODLE_URL)
  const forbidden = [MOODLE_LOGIN_URL, MOODLE_OAUTH2_LOGIN_URL, MOODLE_MOBILE_LAUNCH_URL]
  if (resolved.origin !== MOODLE_URL || forbidden.some(url => resolved.href.startsWith(url))) {
    return null
  }
  return resolved.href
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
