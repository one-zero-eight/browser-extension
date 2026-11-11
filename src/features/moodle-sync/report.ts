/** What the last Moodle data sync did with each course, kept for the popup (SharedStorage.moodleSyncReport). */
export type CourseSyncState = 'waiting' | 'syncing' | 'sent' | 'unchanged' | 'incomplete' | 'failed' | 'skipped'

export interface CourseFileReport {
  /** Files the course lists */
  listed: number
  /** Their bytes are on InNoHassle (uploaded now, or already there) */
  sent: number
  /** Not read: a type or size InNoHassle does not take */
  unsupported: number
  /** Not read: the download from Moodle failed */
  notDownloaded: number
  /** InNoHassle refused them (type, size, or the bytes changed) */
  refused: number
  /** The upload failed; retried at the next sync */
  notUploaded: number
}

export interface CourseSyncReport {
  id: number
  name: string
  state: CourseSyncState
  /** Why the course is skipped or failed */
  note?: string
  files?: CourseFileReport
}

export interface MoodleSyncReport {
  courses: CourseSyncReport[]
}
