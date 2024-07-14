import * as process from 'node:process'
import { defineManifest } from '@crxjs/vite-plugin'
import packageData from '../package.json'

const isDev = process.env.NODE_ENV === 'development'

export default defineManifest({
  name: `${packageData.displayName || packageData.name}${isDev ? ' [dev]' : ''}`,
  description: packageData.description,
  version: packageData.version,

  manifest_version: 3, // Chrome blocks MV2 extensions
  minimum_chrome_version: '96', // Supports MV3

  // @ts-expect-error
  browser_specific_settings: {
    gecko: { // Firefox for Desktop
      id: 'tools@innohassle.ru',
      strict_min_version: '109.0', // Supports MV3
    },
  },

  icons: {
    16: 'icons/logo-16.png',
    32: 'icons/logo-32.png',
    48: 'icons/logo-48.png',
    128: 'icons/logo-128.png',
  },
  web_accessible_resources: [
    {
      resources: ['icons/logo-16.png', 'icons/logo-32.png', 'icons/logo-48.png', 'icons/logo-128.png'],
      matches: [],
    },
    {
      // Injected into the moodle page to keep the session alive
      resources: ['src/entrypoints/content-script-moodle/session-keepalive.js'],
      matches: ['https://moodle.innopolis.university/*'],
    },
  ],

  permissions: [
    // Allows us to store data in chrome.storage
    'storage',
    // Allows us to modify User-Agent for auto sign in
    'declarativeNetRequestWithHostAccess',
  ],
  host_permissions: [
    // Allows us to implement auto sign in
    'https://moodle.innopolis.university/*',
    // Allows us to send requests to our backend
    'https://*.innohassle.ru/*',
  ],

  content_scripts: [
    {
      // Injected into the moodle page to auto sign in and other features
      matches: ['https://moodle.innopolis.university/*'],
      js: ['src/entrypoints/content-script-moodle/index.ts'],
    },
  ],
  background: {
    // Service worker for background tasks
    scripts: ['src/entrypoints/background/index.ts'],
    service_worker: 'src/entrypoints/background/index.ts',
    type: 'module',
  },
  action: {
    // Popup when a user clicks on the extension icon
    default_popup: 'src/entrypoints/popup/index.html',
    default_icon: 'icons/logo-48.png',
  },
  // Extension options page
  options_page: 'src/entrypoints/options/index.html',
})
