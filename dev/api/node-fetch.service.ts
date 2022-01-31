import fetch from 'node-fetch'
import FormData from 'form-data'
import * as fs from 'fs'
import { RequestRestfulAPI, validations } from "../generated/restful-api-frontend-declaration.js"
import { ApiAccessorNodeFetch } from '@protocol-based-web-framework/restful-api-consumer'

const apiAccessor = new ApiAccessorNodeFetch(validations, fetch, FormData, 'http://localhost:3000', {
  cookie: 'sid=123',
})

export const requestRestfulAPI: RequestRestfulAPI = apiAccessor.requestRestfulAPI

await requestRestfulAPI('GET', '/api/blogs', { query: { ignoredFields: ['posts', 'meta'] } })
await requestRestfulAPI('GET', '/api/blogs/{id}', { path: { id: 1 } })
const blogs = await requestRestfulAPI('POST', '/api/blogs', { body: { content: 'test' } })
console.info(blogs)
await requestRestfulAPI('PATCH', '/api/blogs/2', { body: { content: 'test222' } })
await requestRestfulAPI('DELETE', '/api/blogs/2')
await requestRestfulAPI('POST', '/api/blogs/upload', {
  body: {
    id: 1,
    file: fs.createReadStream('./README.md'),
  },
})
const downloadData = await requestRestfulAPI('GET', '/api/blogs/1/download')
console.info(downloadData)
const text = await requestRestfulAPI('GET', '/api/blogs/1/text')
console.info(text)
