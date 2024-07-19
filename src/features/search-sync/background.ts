import axios from 'axios'
import type { MoodleClientFunctionTypes } from 'moodle-typed-ws'
import pLimit from 'p-limit'
import { sendMessage } from '@/shared/messages'
import { getStored, setStored } from '@/shared/storage'
import { downloadFileByUrl } from '@/shared/moodle-ws-api/download-file'
import type { FlattenInContentsWithPresignedUrl, InContents } from '@/shared/innohassle-api/search'
import { search } from '@/shared/innohassle-api/search'
import { moodle } from '@/shared/moodle-ws-api'

const DELAY = 24 * 60 * 60 * 1000 // 24 hours
const MAX_CONCURRENT_REQUESTS = 10 // Limit the number of concurrent requests

const state = {
  // Lock to prevent multiple concurrent processes
  isSyncingCourses: false,

  // Limit the number of concurrent uploads
  queue: pLimit(MAX_CONCURRENT_REQUESTS),
  totalUploads: 0,
  currentUploads: 0,
}

type CourseContents = MoodleClientFunctionTypes.CoreCourseGetContentsWSResponse
type CourseModule = CourseContents[number]['modules'][number]

/**
 * Sync all courses with InNoHassle Search for indexing.
 */
export async function syncCourses() {
  if (state.isSyncingCourses) {
    return
  }
  state.isSyncingCourses = true

  // Check user preference
  const allowSendingCourses = await getStored('allowSyncingCourses')
  if (allowSendingCourses === false) {
    state.isSyncingCourses = false
    return // The user disabled this feature
  }

  const sentCoursesLastUpdateMS = await getStored('syncCoursesLastUpdateMS')
  if (sentCoursesLastUpdateMS && Date.now() - sentCoursesLastUpdateMS < DELAY) {
    state.isSyncingCourses = false
    return // Do not sync courses too often
  }

  console.log('Syncing all courses with InNoHassle Search')
  try {
    // Sync all courses with InNoHassle Search
    await syncAllCourses()

    // Save last sync time
    await setStored('syncCoursesLastUpdateMS', Date.now())
  }
  catch (e) {
    console.log('Error: Couldn\'t fetch and sync courses')
  }
  console.log('Finished syncing all courses')
  state.isSyncingCourses = false
}

async function syncAllCourses() {
  state.queue.clearQueue()
  state.totalUploads = 0
  state.currentUploads = 0

  if (!state.isSyncingCourses)
    return // Stop syncing if the user disabled this feature

  // Retrieve courses list from Moodle
  const { courses } = await moodle.core.course.getEnrolledCoursesByTimelineClassification({ classification: 'all' })

  if (!state.isSyncingCourses)
    return // Stop syncing if the user disabled this feature

  // Retrieve course structure from Moodle
  console.log('Fetching course contents from Moodle')
  const contentsByCourseId: Record<number, CourseContents | undefined> = {}
  const modulesByCourseId: Record<number, CourseModule[] | undefined> = {}
  const limit = pLimit(MAX_CONCURRENT_REQUESTS)
  await Promise.all(courses.map(async ({ id }) => limit(async () => {
    if (!state.isSyncingCourses)
      return // Stop syncing if the user disabled this feature

    const contents = await moodle.core.course.getContents({ courseid: id })
    contentsByCourseId[id] = contents
    modulesByCourseId[id] = contents.flatMap(section => section.modules)
  })))

  if (!state.isSyncingCourses)
    return // Stop syncing if the user disabled this feature

  // Sync course structure with InNoHassle Search
  console.log('Syncing course info')
  await search.moodleCourseContent(courses.map(course => ({
    course_id: course.id,
    course_fullname: course.fullname,
    sections: contentsByCourseId[course.id]?.map(s => ({
      id: s.id,
      summary: s.summary,
      modules: s.modules.map(m => ({
        id: m.id,
        modname: m.modname,
        name: m.name,
        contents: m.contents?.map(c => ({
          type: c.type,
          filename: c.filename,
          timecreated: c.timecreated,
          timemodified: c.timemodified,
        })),
      })),
    })) ?? [],
  })))

  if (!state.isSyncingCourses)
    return // Stop syncing if the user disabled this feature

  // Check whether the course files need to be uploaded
  console.log('Checking if contents need to be uploaded')
  const needToUpload = await search.moodleNeedToUploadContents(courses.flatMap((course) => {
    const contents = contentsByCourseId[course.id]
    const modules = modulesByCourseId[course.id]
    if (!contents || !modules) {
      return []
    }

    return modules.reduce((acc, module) => {
      if (!module.contents || module.contents.length === 0) {
        return acc
      }

      return [...acc, {
        course_id: course.id,
        module_id: module.id,
        contents: module.contents.map(c => ({
          type: c.type,
          filename: c.filename,
          timecreated: c.timecreated,
          timemodified: c.timemodified,
        })),
      }]
    }, [] as InContents[])
  }))
  console.log(`Need to upload: ${needToUpload.length} modules`)

  if (needToUpload.length === 0) {
    // No files to upload
    return
  }

  if (!state.isSyncingCourses)
    return // Stop syncing if the user disabled this feature

  // Find urls for each file
  const toUpload = needToUpload.reduce((acc, module) => {
    const originalModule = modulesByCourseId[module.course_id]?.find(m => m.id === module.module_id)
    const originalContent = originalModule?.contents?.find(c => c.filename === module.content.filename)
    if (!originalModule || !originalContent || !originalContent.fileurl) {
      return acc
    }

    return [...acc, {
      module,
      fileUrl: originalContent.fileurl,
    }]
  }, [] as { module: FlattenInContentsWithPresignedUrl, fileUrl: string }[])

  // Upload course files to InNoHassle Search module by module
  // Limit the number of concurrent uploads
  console.log(`Uploading ${toUpload.length} files`)
  state.totalUploads = toUpload.length
  const promises = toUpload.map(
    ({ module, fileUrl }) => state.queue(async () => {
      if (!state.isSyncingCourses)
        throw new Error('Syncing stopped') // Stop syncing if the user disabled this feature

      await sendFile(module, fileUrl)
    }).then(() => {
      state.currentUploads += 1
      console.log(`Uploaded files: ${state.currentUploads} / ${state.totalUploads}`)
    }),
  )
  await Promise.all(promises)

  if (!state.isSyncingCourses)
    return // Stop syncing if the user disabled this feature

  console.log('Finished syncing all courses')
}

/**
 * Upload course module files to InNoHassle Search for indexing.
 */
export async function sendFile(module: FlattenInContentsWithPresignedUrl, fileUrl: string) {
  console.log(`Downloading file for course ${module.course_id} module ${module.module_id} (${fileUrl})`)
  const blob = await downloadFileByUrl(fileUrl)

  console.log(`Uploading files for course ${module.course_id} module ${module.module_id}`)
  const resp = await axios({
    url: module.presigned_url,
    method: 'PUT',
    data: blob,
  })

  if (resp.status !== 200) {
    console.log(`Error: Couldn't upload file for course ${module.course_id} module ${module.module_id}`)
    return
  }

  console.log(`File uploaded for course ${module.course_id} module ${module.module_id}`)
  await search.moodleContentUploaded({
    course_id: module.course_id,
    module_id: module.module_id,
    content: module.content,
  })
}

/**
 * Stop syncing courses.
 */
export function stopSync() {
  state.queue.clearQueue()
  state.isSyncingCourses = false
}

/**
 * Send syncing progress as message.
 */
export function sendSyncProgress() {
  sendMessage('SYNCING_PROGRESS', {
    isSyncing: state.isSyncingCourses,
    current: state.currentUploads,
    total: state.totalUploads,
  })
}
