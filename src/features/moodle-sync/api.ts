// Hand-written client of /users/my-moodle of the InNoHassle Search API (the generated one reads the deployed spec).
// Datetimes are unix seconds.
import { searchQueryPromise } from '@/shared/innohassle-api/search/axios'

export interface MoodleCourseIn {
  course_id: number
  fullname: string
  shortname: string
  starts_at: number | null
  ends_at: number | null
}

export interface MoodleEventIn {
  event_id: number
  course_id: number | null
  group_id: number | null
  name: string
  description_html: string
  event_type: string
  module: string | null
  starts_at: number
  duration_seconds: number
  url: string | null
  pending: boolean
}

export interface MoodleGradeItemIn {
  item_id: number
  name: string
  item_type: string
  module: string | null
  grade: number | null
  grade_min: number | null
  grade_max: number | null
  grade_text: string | null
  percentage_text: string | null
  feedback_html: string
  graded_at: number | null
}

export interface MoodleCourseGradesIn {
  course_id: number
  items: MoodleGradeItemIn[]
}

export interface MoodleAssignmentIn {
  assignment_id: number
  module_id: number
  name: string
  description_html: string
  opens_at: number | null
  due_at: number | null
  cutoff_at: number | null
  grading_due_at: number | null
  max_grade: number | null
  submission_status: string | null
  grading_status: string | null
  grade_html: string
}

export interface MoodleCourseAssignmentsIn {
  course_id: number
  items: MoodleAssignmentIn[]
}

export interface MoodleQuizIn {
  quiz_id: number
  module_id: number
  name: string
  description_html: string
  opens_at: number | null
  closes_at: number | null
  time_limit_seconds: number | null
  attempts_allowed: number
  attempts_used: number | null
  best_grade: number | null
  max_grade: number | null
}

export interface MoodleCourseQuizzesIn {
  course_id: number
  items: MoodleQuizIn[]
}

export interface MoodleCompletionIn {
  module_id: number
  state: number
  completed_at: number | null
}

export interface MoodleCourseCompletionIn {
  course_id: number
  items: MoodleCompletionIn[]
}

export interface MoodleGroupIn {
  group_id: number
  name: string
}

export interface MoodleCourseGroupsIn {
  course_id: number
  groups: MoodleGroupIn[]
}

export interface MoodleOverviewIn {
  moodle_user_id: number
  moodle_username: string
  courses: MoodleCourseIn[]
  // null: Moodle did not answer; the stored events stay
  events: MoodleEventIn[] | null
  // Only the courses Moodle returned; the others keep theirs
  grades: MoodleCourseGradesIn[]
  assignments: MoodleCourseAssignmentsIn[]
  quizzes: MoodleCourseQuizzesIn[]
  completion: MoodleCourseCompletionIn[]
  groups: MoodleCourseGroupsIn[]
}

export interface MoodleFileIn {
  filename: string
  url: string
  size_bytes: number | null
  mime_type: string | null
  modified_at: number | null
}

export interface MoodleModuleIn {
  module_id: number
  name: string
  module: string
  url: string | null
  html: string
  files: MoodleFileIn[]
}

export interface MoodleSectionIn {
  section_id: number
  name: string
  summary_html: string
  modules: MoodleModuleIn[]
}

export interface MoodleAnnouncementIn {
  discussion_id: number
  title: string
  html: string
  posted_at: number
}

export interface MoodleCourseContentIn {
  sections: MoodleSectionIn[]
  announcements: MoodleAnnouncementIn[]
}

export function putMoodleOverview(body: MoodleOverviewIn) {
  return searchQueryPromise<{ courses_without_content: number[] }>({
    url: '/users/my-moodle/overview',
    method: 'PUT',
    data: body,
  })
}

export function putMoodleCourseContent(courseId: number, body: MoodleCourseContentIn) {
  return searchQueryPromise<void>({
    url: `/users/my-moodle/courses/${courseId}/content`,
    method: 'PUT',
    data: body,
  })
}

export function deleteMoodleData() {
  return searchQueryPromise<void>({ url: '/users/my-moodle', method: 'DELETE' })
}
