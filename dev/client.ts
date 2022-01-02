import produce from 'immer'
import qs from 'qs'
import { ajv } from "../dist/nodejs/restful-api-frontend-declaration-lib"
import { RequestRestfulAPI, validations } from "./restful-api-frontend-declaration"

const composeUrl = (
  url: string,
  args?: { path?: { [key: string]: string | number }, query?: {} }
) => {
  if (args?.path) {
    for (const key in args.path) {
      url = url.replace(`{${key}}`, args.path[key].toString())
    }
  }
  if (args?.query) {
    url += '?' + qs.stringify(args.query, {
      arrayFormat: 'brackets',
    })
  }
  return url
}

function validateByJsonSchema(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  ignoredFields: string[] | undefined,
  input: unknown,
) {
  const validation = validations.find((v) => v.method === method && v.url === url)
  if (validation) {
    if (ignoredFields && ignoredFields.length > 0) {
      const schemaWithoutIgnoredFields = produce(
        validation.schema as {
          definitions: {
            [key: string]: {
              properties: { [key: string]: unknown }
              required?: string[]
            }
          }
        },
        (draft) => {
          for (const omittedReference of validation.omittedReferences) {
            for (const ignoredField of ignoredFields) {
              delete draft.definitions[omittedReference].properties[ignoredField]
            }
            const required = draft.definitions[omittedReference].required
            if (required) {
              draft.definitions[omittedReference].required = required.filter((r) => !ignoredFields.includes(r))
            }
          }
        }
      )
      ajv.validate(schemaWithoutIgnoredFields, input)
      if (ajv.errors?.[0]?.message) {
        throw new Error(ajv.errors[0].message)
      }
    } else {
      validation.validate(input)
      if (validation.validate.errors?.[0]?.message) {
        throw new Error(validation.validate.errors[0].message)
      }
    }
  }
}

const requestRestfulAPI: RequestRestfulAPI = async (
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  args?: {
    path?: { [key: string]: string | number },
    query?: { ignoredFields?: string[], attachmentFileName?: string },
    body?: {}
  }
) => {
  const composedUrl = composeUrl(url, args)
  let body: BodyInit | undefined
  let headers: HeadersInit | undefined
  if (args?.body) {
    body = JSON.stringify(args.body)
    headers = { 'content-type': 'application/json' }
  }
  const result = await fetch(
    composedUrl,
    {
      method,
      body,
      headers,
    })
  const contentType = result.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    const json = await result.json()
    validateByJsonSchema(method, url, args?.query?.ignoredFields, json)
    return json
  }
  return result.blob()
}

requestRestfulAPI('GET', '/api/blogs/{id}', { path: { id: 1 } })
