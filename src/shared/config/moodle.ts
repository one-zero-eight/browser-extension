export const MOODLE_URL = 'https://moodle.innopolis.university'
export const MOODLE_WS_URL = `${MOODLE_URL}/webservice/rest/server.php`
export const MOODLE_MOBILE_LAUNCH_URL = `${MOODLE_URL}/admin/tool/mobile/launch.php`
export const MOODLE_LOGIN_URL = `${MOODLE_URL}/login/index.php`
export const MOODLE_DASHBOARD_URL = `${MOODLE_URL}/my/`
export const MOODLE_GRADES_URL = (id: number) => `${MOODLE_URL}/grade/report/user/index.php?id=${id}`
