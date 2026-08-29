/**
 * Thrown when a Moodle Web Services call can't proceed because there is no valid
 * session token (missing, or rejected by Moodle as `invalidtoken`).
 *
 * The check below matches on `name` as well as `instanceof`: `instanceof` is
 * unreliable across the Firefox content-script compartment boundary, which is
 * the same reason the download-course feature avoids Axios / `URLSearchParams` /
 * fflate's worker path.
 */
export class MoodleNotSignedInError extends Error {
  constructor(message = 'Sign in to Moodle') {
    super(message)
    this.name = 'MoodleNotSignedInError'
  }
}

export function isMoodleNotSignedInError(e: unknown): boolean {
  return e instanceof MoodleNotSignedInError
    || (e instanceof Error && e.name === 'MoodleNotSignedInError')
}
