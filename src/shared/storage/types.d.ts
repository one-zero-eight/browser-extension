import type { MoodleClientFunctionTypes } from 'moodle-typed-ws'

export type Courses =
  MoodleClientFunctionTypes.CoreCourseGetEnrolledCoursesByTimelineClassificationWSResponse['courses']

export interface SharedStorage {
  // Web services API token
  token: string
  privateToken: string

  // Autologin
  autologinEnabled: boolean
  autologinLastSuccessMS: number

  // User info
  userId: number

  // Courses
  courses: Courses
  coursesLastUpdateMS: number

  // InNoHassle API
  innohassleToken: string
  innohassleSearchUrl: string
  innohassleEventsUrl: string

  // User pinned links
  pinnedLinks: string
}
