import type { AxiosRequestConfig } from 'axios'
import axios from 'axios'
import { getToken, invalidateToken } from '../token-store'
import { INNOHASSLE_SEARCH_URL } from '@/shared/config/innohassle'

// Axios client for InNoHassle Search API
export const AxiosSearch = axios.create({
  baseURL: INNOHASSLE_SEARCH_URL,
})

// Add token to Authorization header
AxiosSearch.interceptors.request.use(async (request) => {
  const token = await getToken()
  if (token) {
    request.headers.Authorization = `Bearer ${token}`
  }
  return request
})

// Invalidate token on errors
AxiosSearch.interceptors.response.use(
  response => response,
  async (error) => {
    const { response } = error
    if (response.status === 401) {
      invalidateToken()
      return Promise.reject(error)
    }
  },
)

// Method to query InNoHassle Search API and receive 'data' field on success
export function searchQueryPromise<T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> {
  const source = axios.CancelToken.source()
  const promise = AxiosSearch<T>({
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
