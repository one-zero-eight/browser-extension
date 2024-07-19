export interface Messages {
  POPUP_OPEN: void
  MOODLE_LOAD: void

  REQUEST_AUTOLOGIN: void
  AUTOLOGIN_FAILED: void
  AUTOLOGIN_SUCCEEDED: void
  AUTOLOGIN_LAST_SUCCESS: number

  REQUEST_SYNC: void
  STOP_SYNC: void
  REQUEST_SYNC_PROGRESS: void
  SYNCING_PROGRESS: { isSyncing: boolean, current: number, total: number }
}
