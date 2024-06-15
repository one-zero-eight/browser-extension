import type { MoodleClientTypes } from 'moodle-typed-ws'
import { serialize } from 'object-to-formdata'
import { MOODLE_WS_URL } from '@/shared/config/moodle'
import { wsQueryPromise } from '@/shared/moodle-ws-api/axios'

type MoodleFunction = (arg: object) => Promise<unknown>

type MoodleClient = MoodleClientTypes & {
  utils: {
    request: <F extends MoodleFunction>(
      functionName: string,
      params: Parameters<F>[0],
    ) => ReturnType<F>
  }
}

function serializeForm(data: unknown) {
  return Object.fromEntries([
    ...serialize(data, {
      indices: true,
      booleansAsIntegers: true, // Moodle doesn't understand booleans
    }).entries(),
  ])
}

function snakeCase(str: string) {
  return str
    .replace(/^(.)/g, match => match.toLowerCase())
    .replace(/[A-Z]/g, g => `_${g.toLowerCase()}`)
}

function callMoodleApi<F extends MoodleFunction>(
  client: MoodleClient,
  funcPath: string[],
  params: object,
) {
  const method = snakeCase(funcPath.join('_'))
  return client.utils.request<F>(method, params)
}

function createClientProxy<T extends MoodleClient>(
  client: T,
  path: string[] = [],
): T {
  return new Proxy(client, {
    apply(target, thisArg, argArray) {
      // If the function is called, we call the Moodle API
      return callMoodleApi(client, path, argArray[0])
    },
    get(target, prop) {
      if (hasPath([prop], client)) {
        // Return object property if it exists
        return client[prop as keyof T]
      }
      else {
        // Otherwise, return a proxy for the next level.
        // The object will still be empty, but since we apply deep typing
        // to the object, the proxy will be able to return the correct type.
        return createClientProxy(client, [
          ...path,
          prop as string,
        ]) as T[keyof T] //
      }
    },
  })
}

function hasPath(_path: any[], obj: any) {
  if (_path.length === 0 || obj == null) {
    return false
  }
  let val = obj
  let idx = 0
  while (idx < _path.length) {
    if (!(val == null) && Object.prototype.hasOwnProperty.call(val, _path[idx])) {
      val = val[_path[idx]]
      idx += 1
    }
    else {
      return false
    }
  }
  return true
}

const client = (() => {}) as unknown as MoodleClient
const utils = {
  request: async <F extends MoodleFunction>(
    functionName: string,
    params: Parameters<F>[0],
  ) => {
    // Use custom Axios instance to add token to request data
    return wsQueryPromise<ReturnType<F>>({
      url: MOODLE_WS_URL,
      data: {
        moodlewsrestformat: 'json',
        wsfunction: functionName,
        ...serializeForm(params),
      },
    })
  },
} as any
client.utils = utils
export const moodle = createClientProxy(client)
