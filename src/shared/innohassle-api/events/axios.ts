import type { AxiosRequestConfig } from 'axios'
import axios from 'axios'
import { getToken, invalidateToken } from '../token-store'
import { getStored } from '@/shared/storage'
import { INNOHASSLE_EVENTS_URL } from '@/shared/config/innohassle'

// Axios client for InNoHassle Events API
export const AxiosEvents = axios.create({
  baseURL: INNOHASSLE_EVENTS_URL,
})

// Add token to Authorization header
AxiosEvents.interceptors.request.use(async (request) => {
  const overrideBaseUrl = await getStored('innohassleEventsUrl')
  if (overrideBaseUrl) {
    request.baseURL = overrideBaseUrl
  }

  const token = await getToken()
  if (token) {
    request.headers.Authorization = `Bearer ${token}`
  }

  return request
})

// Invalidate token on errors
AxiosEvents.interceptors.response.use(
  response => response,
  async (error) => {
    const { response } = error
    if (response.status === 401) {
      invalidateToken()
      return Promise.reject(error)
    }
  },
)

// Method to query InNoHassle Events API and receive 'data' field on success
export function eventsQueryPromise<T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> {
  const source = axios.CancelToken.source()
  const promise = AxiosEvents<T>({
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
