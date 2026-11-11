import type { LimitFunction } from 'p-limit'
import pLimit from 'p-limit'
import type {
  MoodleAssignmentIn,
  MoodleCourseAssignmentsIn,
  MoodleCourseCompletionIn,
  MoodleCourseContentIn,
  MoodleCourseGradesIn,
  MoodleCourseGroupsIn,
  MoodleCourseIn,
  MoodleCourseQuizzesIn,
  MoodleEventIn,
  MoodleFileIn,
  MoodleOverviewIn,
  MoodleQuizIn,
} from './api'
import { downloadFileByUrl } from '@/shared/moodle-ws-api/download-file'
import { moodle } from '@/shared/moodle-ws-api'

const HTML_MAX = 200_000
const DESCRIPTION_MAX = 20_000
const DAY = 86400
// Assignments, quizzes, completion and groups are read only for courses that ended at most this long ago
const ACTIVE_RECENT_DAYS = 30
const MOODLE_URL = 'https://moodle.innopolis.university/'
const MAX_FILES_PER_MODULE = 200
// The server reads these types up to this size (a file of another type or a bigger one is not downloaded)
const FILE_MAX = 100 * 1024 * 1024
const FILE_SUFFIXES: Record<string, true> = Object.fromEntries(
  ['.pdf', '.doc', '.docx', '.rtf', '.odt', '.ppt', '.pptx', '.odp', '.xls', '.xlsx', '.ods', '.txt', '.md', '.png', '.jpg', '.jpeg', '.webp'].map(s => [s, true]),
)

function cut(html: string | null | undefined, max = HTML_MAX) {
  return (html ?? '').slice(0, max)
}

// Moodle uses 0 for "none" in its dates
function date(seconds: number | null | undefined) {
  return seconds || null
}

function present<T>(x: T | undefined): x is T {
  return x !== undefined
}

// Runs `fn`; a throw is logged and gives `undefined`, which leaves that part out of the upload (the server keeps its old data)
async function attempt<T>(what: string, fn: () => Promise<T>): Promise<T | undefined> {
  try {
    return await fn()
  }
  catch (e) {
    console.warn(`Moodle sync: ${what} failed`, e)
    return undefined
  }
}

export async function collectOverview(): Promise<{ overview: MoodleOverviewIn, activeCourseIds: number[] }> {
  const now = Math.floor(Date.now() / 1000)
  const windowFrom = now - 30 * DAY
  const windowTo = now + 180 * DAY
  const limit = pLimit(2)

  const siteInfo = await moodle.core.webservice.getSiteInfo({})
  const userid = siteInfo.userid
  const moodleCourses = await moodle.core.enrol.getUsersCourses({ userid })

  const courses: MoodleCourseIn[] = moodleCourses.map(c => ({
    course_id: c.id,
    fullname: c.fullname,
    shortname: c.shortname,
    starts_at: date(c.startdate),
    ends_at: date(c.enddate),
  }))
  const allCourseIds = moodleCourses.map(c => c.id)
  const activeCourseIds = moodleCourses
    .filter(c => !c.enddate || c.enddate > now - ACTIVE_RECENT_DAYS * DAY)
    .map(c => c.id)

  const events = await attempt('events', async () => {
    const byId = new Map<number, MoodleEventIn>()
    const calendar = await moodle.core.calendar.getCalendarEvents({
      events: { courseids: allCourseIds },
      options: { userevents: true, siteevents: true, timestart: windowFrom, timeend: windowTo, ignorehidden: true },
    })
    for (const e of calendar.events) {
      byId.set(e.id, {
        event_id: e.id,
        course_id: date(e.courseid),
        group_id: date(e.groupid),
        name: e.name,
        description_html: cut(e.description),
        event_type: e.eventtype,
        module: e.modulename || null,
        starts_at: e.timestart,
        duration_seconds: e.timeduration ?? 0,
        url: null,
        pending: false,
      })
    }
    let after: number | undefined
    for (;;) {
      const page = await moodle.core.calendar.getActionEventsByTimesort({
        timesortfrom: windowFrom,
        timesortto: windowTo,
        limitnum: 50,
        ...(after !== undefined && { aftereventid: after }),
      })
      for (const e of page.events) {
        const known = byId.get(e.id)
        if (known) {
          known.pending = true
          known.url = e.url ?? known.url
        }
        else {
          byId.set(e.id, {
            event_id: e.id,
            course_id: date(e.course?.id),
            group_id: null,
            name: e.name,
            description_html: cut(e.description),
            event_type: e.eventtype,
            module: e.modulename || null,
            starts_at: e.timestart,
            duration_seconds: 0,
            url: e.url ?? null,
            pending: true,
          })
        }
      }
      if (page.events.length < 50)
        break
      after = page.events[page.events.length - 1].id
    }
    return [...byId.values()]
  })

  const grades = (await Promise.all(allCourseIds.map(courseid => limit(() => attempt(`grades of ${courseid}`, async () => {
    const report = await moodle.gradereport.user.getGradeItems({ courseid, userid })
    const items = report.usergrades[0]?.gradeitems ?? []
    return {
      course_id: courseid,
      items: items.map(g => ({
        item_id: g.id,
        name: g.itemname ?? (g.itemtype === 'course' ? 'Course total' : ''),
        item_type: g.itemtype,
        module: g.itemmodule ?? null,
        grade: g.graderaw ?? null,
        grade_min: g.grademin ?? null,
        grade_max: g.grademax ?? null,
        grade_text: g.gradeformatted || null,
        percentage_text: g.percentageformatted || null,
        feedback_html: cut(g.feedback),
        graded_at: date(g.gradedategraded),
      })),
    } satisfies MoodleCourseGradesIn
  })))))
    .filter(present)

  const assignments = await collectAssignments(activeCourseIds, windowFrom, windowTo, limit)
  const quizzes = await collectQuizzes(activeCourseIds, windowFrom, limit)

  const completion = (await Promise.all(activeCourseIds.map(courseid => limit(() => attempt(`completion of ${courseid}`, async () => {
    const res = await moodle.core.completion.getActivitiesCompletionStatus({ courseid, userid })
    return {
      course_id: courseid,
      items: res.statuses
        .filter(s => s.tracking > 0)
        .map(s => ({ module_id: s.cmid, state: s.state, completed_at: date(s.timecompleted) })),
    } satisfies MoodleCourseCompletionIn
  })))))
    .filter(present)

  const groups = (await Promise.all(activeCourseIds.map(courseid => limit(() => attempt(`groups of ${courseid}`, async () => {
    const res = await moodle.core.group.getCourseUserGroups({ courseid, userid })
    return {
      course_id: courseid,
      groups: res.groups.map(g => ({ group_id: g.id, name: g.name })),
    } satisfies MoodleCourseGroupsIn
  })))))
    .filter(present)

  return {
    overview: {
      moodle_user_id: userid,
      moodle_username: siteInfo.username,
      courses,
      events: events ?? null,
      grades,
      assignments,
      quizzes,
      completion,
      groups,
    },
    activeCourseIds,
  }
}

async function collectAssignments(
  courseids: number[],
  windowFrom: number,
  windowTo: number,
  limit: LimitFunction,
): Promise<MoodleCourseAssignmentsIn[]> {
  const res = await attempt('assignments', () => moodle.mod.assign.getAssignments({ courseids }))
  if (!res)
    return []
  return Promise.all(res.courses.map(async (course) => {
    const items: MoodleAssignmentIn[] = await Promise.all(course.assignments.map(a => limit(async () => {
      const inWindow = !a.duedate || (a.duedate >= windowFrom && a.duedate <= windowTo)
      const status = inWindow
        ? await attempt(`submission status of ${a.id}`, () => moodle.mod.assign.getSubmissionStatus({ assignid: a.id }))
        : undefined
      return {
        assignment_id: a.id,
        module_id: a.cmid,
        name: a.name,
        description_html: cut(a.intro, DESCRIPTION_MAX),
        opens_at: date(a.allowsubmissionsfromdate),
        due_at: date(a.duedate),
        cutoff_at: date(a.cutoffdate),
        grading_due_at: date(a.gradingduedate),
        // Moodle uses a negative number for scales
        max_grade: a.grade > 0 ? a.grade : null,
        submission_status: status?.lastattempt?.submission?.status ?? status?.lastattempt?.teamsubmission?.status ?? null,
        grading_status: status?.lastattempt?.gradingstatus ?? null,
        grade_html: cut(status?.feedback?.gradefordisplay, 2000),
      }
    })))
    return { course_id: course.id, items }
  }))
}

async function collectQuizzes(
  courseids: number[],
  windowFrom: number,
  limit: LimitFunction,
): Promise<MoodleCourseQuizzesIn[]> {
  const res = await attempt('quizzes', () => moodle.mod.quiz.getQuizzesByCourses({ courseids }))
  if (!res)
    return []
  const byCourse = new Map<number, MoodleQuizIn[]>()
  await Promise.all(res.quizzes.map(q => limit(async () => {
    const asked = !q.timeclose || q.timeclose >= windowFrom
    const attempts = asked
      ? await attempt(`attempts of ${q.id}`, () => moodle.mod.quiz.getUserAttempts({ quizid: q.id, status: 'all' }))
      : undefined
    const best = asked
      ? await attempt(`best grade of ${q.id}`, () => moodle.mod.quiz.getUserBestGrade({ quizid: q.id }))
      : undefined
    const item: MoodleQuizIn = {
      quiz_id: q.id,
      module_id: q.coursemodule,
      name: q.name,
      description_html: cut(q.intro, DESCRIPTION_MAX),
      opens_at: date(q.timeopen),
      closes_at: date(q.timeclose),
      time_limit_seconds: date(q.timelimit),
      attempts_allowed: q.attempts ?? 0,
      attempts_used: attempts ? attempts.attempts.length : null,
      best_grade: best?.hasgrade ? (best.grade ?? null) : null,
      max_grade: date(q.grade),
    }
    byCourse.set(q.course, [...(byCourse.get(q.course) ?? []), item])
  })))
  return [...byCourse].map(([course_id, items]) => ({ course_id, items }))
}

function fileLink(fileurl: string) {
  return fileurl.replace('/webservice/pluginfile.php/', '/pluginfile.php/').split('?')[0]
}

export async function sha256Hex(data: BufferSource) {
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('')
}

export interface FileHashCache {
  // File key (url without query|timemodified|size) -> sha256 of its bytes: the last sync's, and this sync's
  old: Record<string, string>
  next: Record<string, string>
}

export async function collectCourseContent(
  courseId: number,
  hashes: FileHashCache,
): Promise<{ content: MoodleCourseContentIn, fileUrls: Map<string, string>, files: { listed: number, unsupported: number, notDownloaded: number } }> {
  const pages = new Map<number, string>()
  const pagesRes = await attempt(`pages of ${courseId}`, () => moodle.mod.page.getPagesByCourses({ courseids: [courseId] }))
  for (const p of pagesRes?.pages ?? [])
    pages.set(p.coursemodule, p.content)

  const contents = await moodle.core.course.getContents({ courseid: courseId })

  const pending: { file: MoodleFileIn, rawUrl: string, filesize: number, timemodified: number }[] = []
  const sections = contents.map((section) => {
    // Only what every student of the course sees is shared with the user's study group; a teacher's sync also lists hidden
    // and restricted material.
    const sectionShareable = section.visible !== 0 && section.uservisible !== false && !section.availabilityinfo
    return {
      section_id: section.id,
      name: section.name ?? '',
      summary_html: cut(section.summary),
      shareable: sectionShareable,
      modules: (section.modules ?? []).map((m) => {
        const files: MoodleFileIn[] = []
        for (const c of m.contents ?? []) {
          if (c.type !== 'file' || !c.fileurl || files.length >= MAX_FILES_PER_MODULE)
            continue
          const url = fileLink(c.fileurl)
          if (!url.startsWith(MOODLE_URL))
            continue
          const file: MoodleFileIn = {
            filename: c.filename,
            url,
            size_bytes: c.filesize ?? null,
            mime_type: c.mimetype ?? null,
            modified_at: date(c.timemodified),
            sha256: null,
          }
          files.push(file)
          pending.push({ file, rawUrl: c.fileurl, filesize: c.filesize ?? 0, timemodified: c.timemodified ?? 0 })
        }
        return {
          module_id: m.id,
          name: m.name,
          module: m.modname,
          url: m.url ?? null,
          external_url: m.modname === 'url' ? ((m.contents ?? []).find(c => c.type === 'url')?.fileurl?.slice(0, 2000) ?? null) : null,
          html: cut(m.modname === 'page' ? (pages.get(m.id) ?? m.description) : m.description),
          files,
          shareable: sectionShareable && m.visible !== 0 && m.uservisible !== false && m.visibleoncoursepage !== 0
          && !m.availabilityinfo,
        }
      }),
    }
  })

  const announcements = await attempt(`announcements of ${courseId}`, async () => {
    const forums = await moodle.mod.forum.getForumsByCourses({ courseids: [courseId] })
    const news = forums.find(f => f.type === 'news')
    if (!news)
      return []
    const res = await moodle.mod.forum.getForumDiscussions({ forumid: news.id, page: 0, perpage: 20 })
    return res.discussions.map(d => ({
      discussion_id: d.discussion,
      title: d.name,
      html: cut(d.message),
      posted_at: d.created,
    }))
  })

  // The files' bytes are hashed (the server stores a file once per hash). A file seen before is not downloaded again.
  const fileUrls = new Map<string, string>()
  const stats = { listed: pending.length, unsupported: 0, notDownloaded: 0 }
  for (const { file, rawUrl, filesize, timemodified } of pending) {
    const suffix = /\.[^.]+$/.exec(file.filename)?.[0].toLowerCase() ?? ''
    if (FILE_SUFFIXES[suffix] !== true || filesize > FILE_MAX) {
      stats.unsupported++
      continue
    }
    const key = `${rawUrl.split('?')[0]}|${timemodified}|${filesize}`
    try {
      const sha = hashes.old[key] ?? await sha256Hex(await (await downloadFileByUrl(rawUrl)).arrayBuffer())
      hashes.next[key] = sha
      file.sha256 = sha
      fileUrls.set(sha, rawUrl)
    }
    catch (e) {
      stats.notDownloaded++
      console.warn(`Moodle sync: file ${file.filename} of course ${courseId} not read`, e)
    }
  }

  return { content: { sections, announcements: announcements ?? [] }, fileUrls, files: stats }
}
