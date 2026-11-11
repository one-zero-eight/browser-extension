/// <reference types="vite/client" />

declare const __APP_VERSION__: string

interface ImportMetaEnv {
  readonly VITE_INNOHASSLE_SEARCH_URL?: string
  readonly VITE_INNOHASSLE_EVENTS_URL?: string
}
