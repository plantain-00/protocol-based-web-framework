import { RequestRestfulAPI, validations } from "./restful-api-frontend-declaration"
import { ApiAccessorFetch } from '../dist/browser'

const apiAccessor = new ApiAccessorFetch(validations)

const requestRestfulAPI: RequestRestfulAPI = apiAccessor.requestRestfulAPI

async function start() {
  await requestRestfulAPI('GET', '/api/blogs', { query: { ignoredFields: ['posts', 'meta'] } })
  await requestRestfulAPI('GET', '/api/blogs/{id}', { path: { id: 1 } })
  await requestRestfulAPI('POST', '/api/blogs', { body: { content: 'test' } })
  await requestRestfulAPI('PATCH', '/api/blogs/1', { body: { content: 'test222' } })
  await requestRestfulAPI('DELETE', '/api/blogs/2')
}

start()