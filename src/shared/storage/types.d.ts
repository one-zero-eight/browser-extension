import type { MoodleClientFunctionTypes } from 'moodle-typed-ws'
import type { MoodleSyncReport } from '@/features/moodle-sync/report'

export type Courses =
  MoodleClientFunctionTypes.CoreCourseGetEnrolledCoursesByTimelineClassificationWSResponse['courses']

export type AllCourses =
  MoodleClientFunctionTypes.CoreEnrolGetUsersCoursesWSResponse

export interface SharedStorage {
  // Web services API token
  token: string
  privateToken: string

  // Autologin
  autologinEnabled: boolean
  autologinLastSuccessMS: number

  // User info
  userId: number

  // Courses in progress (shown on the Moodle dashboard)
  courses: Courses
  coursesLastUpdateMS: number

  // Every enrolled course, including past and future ones
  allCourses: AllCourses
  allCoursesLastUpdateMS: number

  // InNoHassle API
  innohassleToken: string
  innohassleSearchUrl: string
  innohassleEventsUrl: string

  // Moodle calendar sync to InNoHassle
  calendarSyncLastSuccessMS: number
  calendarSyncLastError: string
  // Set while a sync runs; cleared when it ends
  calendarSyncStartedMS: number

  // Moodle sync to InNoHassle
  moodleSyncEnabled: boolean
  moodleSyncLastSuccessMS: number
  moodleSyncLastError: string
  moodleSyncStartedMS: number
  // Per course: what the last sync sent and what it could not (popup)
  moodleSyncReport: MoodleSyncReport
  // Course id -> sha256 hex of the JSON last sent for it
  moodleSyncContentHashes: Record<string, string>
  // File key (url without query|timemodified|size) -> sha256 of its bytes
  moodleSyncFileHashes: Record<string, string>

  // User pinned links
  pinnedLinks: string
}
