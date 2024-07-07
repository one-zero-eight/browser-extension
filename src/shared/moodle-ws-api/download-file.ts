import axios from 'axios'
import { getToken } from '@/shared/moodle-ws-api/token-store'

export async function downloadFileByUrl(fileUrl: string) {
  const token = await getToken()
  if (!token) {
    throw new Error('Token is not present')
  }

  const resp = await axios({
    url: fileUrl,
    params: {
      token: await getToken(),
    },
    responseType: 'blob',
  })
  if (resp.status !== 200) {
    throw new Error('Failed to download file')
  }

  return resp.data as Blob
}
