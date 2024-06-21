import { moodle } from '@/shared/moodle-ws-api'
import { getStored, setStored } from '@/shared/storage'

const DELAY = 60 * 60 * 1000 // 1 hour

export async function fetchCourses(force: boolean = false) {
  const previousCoursesLastUpdateMS = await getStored('coursesLastUpdateMS')
  if (!force && previousCoursesLastUpdateMS && Date.now() - previousCoursesLastUpdateMS < DELAY) {
    return // Do not update courses too often
  }

  console.log('Fetching courses')
  try {
    const { courses } = await moodle.core.course.getEnrolledCoursesByTimelineClassification({
      classification: 'inprogress',
    })
    await setStored('courses', courses)
    await setStored('coursesLastUpdateMS', Date.now())
  }
  catch (e) {
    console.log('Error: Couldn\'t fetch courses')
  }
}
