import type { MoodleClientFunctionTypes } from 'moodle-typed-ws'
import { getStored, setStored } from '@/shared/storage'
import { downloadFileByUrl } from '@/shared/moodle-ws-api/download-file'
import type { InContentsInput, InContentsOutput } from '@/shared/innohassle-api/search'
import { search } from '@/shared/innohassle-api/search'
import { moodle } from '@/shared/moodle-ws-api'

const DELAY = 24 * 60 * 60 * 1000 // 24 hours

const state = {
  // Lock to prevent multiple concurrent processes
  isSyncingCourses: false,
}

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
    // Retrieve courses list from Moodle
    const { courses } = await moodle.core.course.getEnrolledCoursesByTimelineClassification({ classification: 'all' })

    // Sync course data with InNoHassle Search
    await Promise.all(courses.map(course => syncCourseData(course.id, course.fullname)))

    // Save last sync time
    await setStored('syncCoursesLastUpdateMS', Date.now())
  }
  catch (e) {
    console.log('Error: Couldn\'t fetch and sync courses')
  }
  console.log('Finished syncing all courses')
  state.isSyncingCourses = false
}

/**
 * Send course info and files to InNoHassle Search for indexing.
 */
export async function syncCourseData(courseId: number, courseFullName: string) {
  console.log(`Sending course info (courseId: ${courseId}, courseFullName: ${courseFullName})`)
  try {
    // Retrieve course structure from Moodle
    const contents = await moodle.core.course.getContents({ courseid: courseId })

    // Sync course structure with InNoHassle Search
    await syncCourseInfo(courseId, courseFullName, contents)

    // Check whether the course files need to be uploaded
    const needToUpload = await needToUploadContents(courseId, contents)
    console.log(`Need to upload: ${needToUpload.length} modules`)

    // Upload course files to InNoHassle Search module by module
    for (const module of needToUpload) {
      if (module.contents.length === 0) {
        continue
      }
      const section = contents.find(s => s.modules.find(m => m.id === module.module_id))
      const originalModule = section?.modules.find(m => m.id === module.module_id)

      // Collect file URLs for each content
      const fileUrls: string[] = []
      for (const content of module.contents) {
        const originalContent = originalModule?.contents?.find(c => c.filename === content.filename)
        if (!originalContent || !originalContent.fileurl) {
          break
        }
        fileUrls.push(originalContent.fileurl)
      }

      // If all files are found, send them asynchronously
      if (fileUrls.length === module.contents.length) {
        sendFiles(module, fileUrls)
      }
    }
  }
  catch (e) {
    console.log(`Error: Couldn't sync course data (${e})`)
  }
}

/**
 * Sync course info (structure of modules) with InNoHassle Search.
 */
async function syncCourseInfo(courseId: number, courseFullName: string, contents: MoodleClientFunctionTypes.CoreCourseGetContentsWSResponse) {
  return search.moodleCourseContent({
    course_id: courseId,
    course_fullname: courseFullName,
    sections: contents.map(s => ({
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
    })),
  })
}

/**
 * Make request to InNoHassle Search to check if the contents need to be updated.
 */
export async function needToUploadContents(courseId: number, contents: MoodleClientFunctionTypes.CoreCourseGetContentsWSResponse) {
  // Collect info for each module that has contents
  const modules: InContentsInput[] = []
  for (const section of contents) {
    for (const module of section.modules) {
      if (!module.contents || module.contents.length === 0) {
        continue
      }

      modules.push({
        course_id: courseId,
        module_id: module.id,
        contents: module.contents.map(c => ({
          type: c.type,
          filename: c.filename,
          timecreated: c.timecreated,
          timemodified: c.timemodified,
        })),
      })
    }
  }

  // Make request to InNoHassle Search
  return search.moodleNeedToUploadContents(modules)
}

/**
 * Upload course module files to InNoHassle Search for indexing.
 */
export async function sendFiles(module: InContentsOutput, fileUrls: string[]) {
  console.log(`Downloading files for module ${module.module_id} (${fileUrls})`)
  const blobs: Blob[] = await Promise.all(fileUrls.map(downloadFileByUrl))

  console.log(`Uploading files for module ${module.module_id}`)
  await search.moodleUploadContent({
    data: JSON.stringify(module),
    files: blobs,
  })
}
