import { getStored } from '@/shared/storage'

/**
 * Download a Moodle file by its `fileurl`, authenticated with the Web Services
 * token. Uses plain `fetch` (not Axios): Axios' adapters introspect the page's
 * `document` / the `Headers` object, which throws "Permission denied to access
 * property" inside a Firefox content-script sandbox. Reads the token straight
 * from storage (no refresh) to keep this path Axios-free.
 */
export async function downloadFileByUrl(fileUrl: string): Promise<Blob> {
  const token = await getStored('token')
  if (!token) {
    throw new Error('Token is not present')
  }

  const url = new URL(fileUrl)
  url.searchParams.set('token', token)

  const resp = await fetch(url.toString())
  if (!resp.ok) {
    throw new Error(`Failed to download file: HTTP ${resp.status}`)
  }

  return await resp.blob()
}
