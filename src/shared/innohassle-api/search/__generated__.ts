/**
 * Generated by orval v6.31.0 🍺
 * Do not edit manually.
 * InNoHassle-Search
 *
### About this project

 * OpenAPI spec version: 0.1.0
 */
import { searchQueryPromise } from './axios'

export interface MoodleGetMoodleFiles200Item { [key: string]: unknown }

export interface MoodlePreviewMoodleParams {
  course_id: number
  module_id: number
  filename: string
}

export interface SearchAddUserFeedbackParams {
  response_index: number
  feedback: string
}

export interface SearchSearchByQueryParams {
  query: string
  limit?: number
}

export type ValidationErrorLocItem = string | number

export interface ValidationError {
  loc: ValidationErrorLocItem[]
  msg: string
  type: string
}

export type TelegramSourceType = typeof TelegramSourceType[keyof typeof TelegramSourceType]

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const TelegramSourceType = {
  telegram: 'telegram',
} as const

export interface TelegramSource {
  /** Breadcrumbs to the resource. */
  breadcrumbs: string[]
  /** Title of the chat, channel, group */
  chat_title: string
  /** Username of the chat, channel, group */
  chat_username: string
  /** Display name of the resource. */
  display_name: string
  /** Link to the message */
  link: string
  /** Message ID in the chat */
  message_id: number
  type: TelegramSourceType
}

/**
 * Assigned search query index
 */
export type SearchResponsesSearchQueryId = string | null

/**
 * Relevant source for the search.
 */
export type SearchResponseSource = MoodleSource | TelegramSource

/**
 * Score of the search response. Optional.
 */
export type SearchResponseScore = number | null

export interface SearchResponse {
  /** Score of the search response. Optional. */
  score: SearchResponseScore
  /** Relevant source for the search. */
  source: SearchResponseSource
}

export interface SearchResponses {
  /** Responses to the search query. */
  responses: SearchResponse[]
  /** Assigned search query index */
  search_query_id: SearchResponsesSearchQueryId
  /** Text that was searched for. */
  searched_for: string
}

export interface PdfLocation {
  /** Page index in the PDF file. Starts from 1. */
  page_index: number
}

export type MoodleSourceType = typeof MoodleSourceType[keyof typeof MoodleSourceType]

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MoodleSourceType = {
  moodle: 'moodle',
} as const

export type MoodleSourcePreviewLocation = PdfLocation | null

/**
 * Filename of the resource.
 */
export type MoodleSourceFilename = string | null

export interface MoodleSource {
  /** Breadcrumbs to the resource. */
  breadcrumbs: string[]
  /** Course ID in the Moodle system. */
  course_id: number
  /** Course name in the Moodle system. */
  course_name: string
  /** Display name of the resource. */
  display_name: string
  /** Filename of the resource. */
  filename: MoodleSourceFilename
  /** Anchor URL to the resource on Moodle. */
  link: string
  /** Module ID in the Moodle system (resources). */
  module_id: number
  /** Module name in the Moodle system. */
  module_name: string
  preview_location: MoodleSourcePreviewLocation
  /** URL to download the resource. */
  resource_download_url: string
  /** URL to get the preview of the resource. */
  resource_preview_url: string
  /** Type of the resource. */
  resource_type: string
  type: MoodleSourceType
}

export type MoodleEntrySectionSummary = string | null

export type MoodleEntrySectionId = number | null

export interface MoodleEntry {
  contents: MoodleContentSchemaOutput[]
  course_fullname: string
  course_id: number
  /** MongoDB document ObjectID */
  id: string
  module_id: number
  module_modname: string
  module_name: string
  section_id: MoodleEntrySectionId
  section_summary: MoodleEntrySectionSummary
}

export interface MoodleCourse {
  course_id: number
  coursecategory: string
  enddate: number
  fullname: string
  /** MongoDB document ObjectID */
  id: string
  startdate: number
}

export type MoodleContentSchemaOutputTimemodified = number | null

export type MoodleContentSchemaOutputTimecreated = number | null

export interface MoodleContentSchemaOutput {
  filename: string
  timecreated: MoodleContentSchemaOutputTimecreated
  timemodified: MoodleContentSchemaOutputTimemodified
  type: string
}

export type MoodleContentSchemaInputTimemodified = number | null

export type MoodleContentSchemaInputTimecreated = number | null

export interface MoodleContentSchemaInput {
  filename: string
  timecreated?: MoodleContentSchemaInputTimecreated
  timemodified?: MoodleContentSchemaInputTimemodified
  type: string
}

export interface InModule {
  contents?: MoodleContentSchemaInput[]
  id: number
  modname: string
  name: string
}

export interface InSection {
  id: number
  modules: InModule[]
  summary: string
}

export interface InSections {
  course_fullname: string
  course_id: number
  sections: InSection[]
}

export interface InCourse {
  coursecategory: string
  enddate: number
  fullname: string
  id: number
  startdate: number
}

export interface InCourses {
  courses: InCourse[]
}

export interface InContentsOutput {
  contents: MoodleContentSchemaOutput[]
  course_id: number
  module_id: number
}

export interface InContentsInput {
  contents: MoodleContentSchemaInput[]
  course_id: number
  module_id: number
}

export interface HTTPValidationError {
  detail?: ValidationError[]
}

export interface BodyMoodleUploadContent {
  data: string
  files: Blob[]
}

type SecondParameter<T extends (...args: any) => any> = Parameters<T>[1]

export function getInNoHassleSearch() {
/**
 * @summary Search By Query
 */
  const searchSearchByQuery = (
    params: SearchSearchByQueryParams,
    options?: SecondParameter<typeof searchQueryPromise>,
  ) => {
    return searchQueryPromise<SearchResponses>(
      { url: `/search/search`, method: 'GET', params },
      options,
    )
  }

  /**
   * @summary Add User Feedback
   */
  const searchAddUserFeedback = (
    searchQueryId: string,
    params: SearchAddUserFeedbackParams,
    options?: SecondParameter<typeof searchQueryPromise>,
  ) => {
    return searchQueryPromise<unknown>(
      { url: `/search/search/${searchQueryId}/feedback`, method: 'POST', params },
      options,
    )
  }

  /**
   * @summary Preview Moodle
   */
  const moodlePreviewMoodle = (
    params: MoodlePreviewMoodleParams,
    options?: SecondParameter<typeof searchQueryPromise>,
  ) => {
    return searchQueryPromise<unknown>(
      { url: `/moodle/preview`, method: 'GET', params },
      options,
    )
  }

  /**
   * @summary Get Moodle Files
   */
  const moodleGetMoodleFiles = (

    options?: SecondParameter<typeof searchQueryPromise>) => {
    return searchQueryPromise<MoodleGetMoodleFiles200Item[]>(
      { url: `/moodle/files`, method: 'GET',
      },
      options,
    )
  }

  /**
   * @summary Batch Upsert Courses
   */
  const moodleBatchUpsertCourses = (
    inCourses: InCourses,
    options?: SecondParameter<typeof searchQueryPromise>,
  ) => {
    return searchQueryPromise<unknown>(
      { url: `/moodle/batch-courses`, method: 'POST', headers: { 'Content-Type': 'application/json' }, data: inCourses },
      options,
    )
  }

  /**
   * @summary Courses
   */
  const moodleCourses = (

    options?: SecondParameter<typeof searchQueryPromise>) => {
    return searchQueryPromise<MoodleCourse[]>(
      { url: `/moodle/courses`, method: 'GET',
      },
      options,
    )
  }

  /**
   * @summary Course Content
   */
  const moodleCourseContent = (
    inSections: InSections,
    options?: SecondParameter<typeof searchQueryPromise>,
  ) => {
    return searchQueryPromise<unknown>(
      { url: `/moodle/set-course-content`, method: 'POST', headers: { 'Content-Type': 'application/json' }, data: inSections },
      options,
    )
  }

  /**
   * @summary Courses Content
   */
  const moodleCoursesContent = (

    options?: SecondParameter<typeof searchQueryPromise>) => {
    return searchQueryPromise<MoodleEntry[]>(
      { url: `/moodle/courses-content`, method: 'GET',
      },
      options,
    )
  }

  /**
   * @summary Need To Upload Contents
   */
  const moodleNeedToUploadContents = (
    inContentsInput: InContentsInput[],
    options?: SecondParameter<typeof searchQueryPromise>,
  ) => {
    return searchQueryPromise<InContentsOutput[]>(
      { url: `/moodle/need-to-upload-contents`, method: 'POST', headers: { 'Content-Type': 'application/json' }, data: inContentsInput },
      options,
    )
  }

  /**
   * @summary Upload Content
   */
  const moodleUploadContent = (
    bodyMoodleUploadContent: BodyMoodleUploadContent,
    options?: SecondParameter<typeof searchQueryPromise>,
  ) => {
    const formData = new FormData()
    bodyMoodleUploadContent.files.forEach(value => formData.append('files', value))
    formData.append('data', bodyMoodleUploadContent.data)

    return searchQueryPromise<unknown>(
      { url: `/moodle/upload-contents`, method: 'POST', headers: { 'Content-Type': 'multipart/form-data' }, data: formData },
      options,
    )
  }

  return { searchSearchByQuery, searchAddUserFeedback, moodlePreviewMoodle, moodleGetMoodleFiles, moodleBatchUpsertCourses, moodleCourses, moodleCourseContent, moodleCoursesContent, moodleNeedToUploadContents, moodleUploadContent }
}
export type SearchSearchByQueryResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getInNoHassleSearch>['searchSearchByQuery']>>>
export type SearchAddUserFeedbackResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getInNoHassleSearch>['searchAddUserFeedback']>>>
export type MoodlePreviewMoodleResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getInNoHassleSearch>['moodlePreviewMoodle']>>>
export type MoodleGetMoodleFilesResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getInNoHassleSearch>['moodleGetMoodleFiles']>>>
export type MoodleBatchUpsertCoursesResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getInNoHassleSearch>['moodleBatchUpsertCourses']>>>
export type MoodleCoursesResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getInNoHassleSearch>['moodleCourses']>>>
export type MoodleCourseContentResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getInNoHassleSearch>['moodleCourseContent']>>>
export type MoodleCoursesContentResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getInNoHassleSearch>['moodleCoursesContent']>>>
export type MoodleNeedToUploadContentsResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getInNoHassleSearch>['moodleNeedToUploadContents']>>>
export type MoodleUploadContentResult = NonNullable<Awaited<ReturnType<ReturnType<typeof getInNoHassleSearch>['moodleUploadContent']>>>
