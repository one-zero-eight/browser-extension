import type { AxiosRequestConfig } from 'axios'
import axios from 'axios'
import { getToken, invalidateToken } from './token-store'
import { MOODLE_WS_URL } from '@/shared/config/moodle'

// Axios client for Moodle Web service API
export const AxiosWS = axios.create({
  baseURL: MOODLE_WS_URL,
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    // Browser doesn't allow to set User-Agent here.
    // Extension should use declarativeNetRequest rules.
    // "User-Agent": "MoodleMobile",
  },
})

// Add token to request data
AxiosWS.interceptors.request.use(async (request) => {
  const token = await getToken()
  if (token) {
    request.data = {
      ...request.data,
      wstoken: token,
    }
  }
  return request
})

// Invalidate token on errors
AxiosWS.interceptors.response.use(
  async (response) => {
    if (response.data.errorcode !== undefined) {
      if (response.data.errorcode === 'invalidtoken') {
        await invalidateToken()
      }
      return Promise.reject(response.data)
    }
    return response
  },
  async (error) => {
    return Promise.reject(error)
  },
)

// Method to query Web service API and receive 'data' field on success
export function wsQueryPromise<T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> {
  const source = axios.CancelToken.source()
  const promise = AxiosWS<T>({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data)

  // @ts-expect-error
  promise.cancel = () => {
    source.cancel('Query was cancelled')
  }

  return promise
}
