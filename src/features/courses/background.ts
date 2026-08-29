import { moodle } from '@/shared/moodle-ws-api'
import { getStored, setStored } from '@/shared/storage'

const DELAY = 60 * 60 * 1000 // 1 hour

/**
 * Courses currently in progress (matches the Moodle dashboard).
 * Returns `true` on success, `false` if the request failed.
 */
export async function fetchCourses(force: boolean = false): Promise<boolean> {
  const previousCoursesLastUpdateMS = await getStored('coursesLastUpdateMS')
  if (!force && previousCoursesLastUpdateMS && Date.now() - previousCoursesLastUpdateMS < DELAY) {
    return true // Do not update courses too often
  }

  console.log('Fetching in-progress courses')
  try {
    const { courses } = await moodle.core.course.getEnrolledCoursesByTimelineClassification({
      classification: 'inprogress',
    })
    await setStored('courses', courses)
    await setStored('coursesLastUpdateMS', Date.now())
    return true
  }
  catch (e) {
    console.log('Error: Couldn\'t fetch in-progress courses', e)
    return false
  }
}

/**
 * Every course the current user is enrolled in, including finished and
 * not-yet-started ones. Uses `core_enrol_get_users_courses`, which returns the
 * full list regardless of timeline (unlike the dashboard classification WS).
 * Returns `true` on success, `false` if the request failed.
 */
export async function fetchAllCourses(force: boolean = false): Promise<boolean> {
  const previousUpdateMS = await getStored('allCoursesLastUpdateMS')
  if (!force && previousUpdateMS && Date.now() - previousUpdateMS < DELAY) {
    return true
  }

  console.log('Fetching all enrolled courses')
  try {
    let userId = await getStored('userId')
    if (!userId) {
      const siteInfo = await moodle.core.webservice.getSiteInfo({})
      userId = siteInfo.userid
      await setStored('userId', userId)
    }

    const courses = await moodle.core.enrol.getUsersCourses({ userid: userId })
    courses.sort((a, b) => a.fullname.localeCompare(b.fullname))

    await setStored('allCourses', courses)
    await setStored('allCoursesLastUpdateMS', Date.now())
    return true
  }
  catch (e) {
    console.log('Error: Couldn\'t fetch all courses', e)
    return false
  }
}
