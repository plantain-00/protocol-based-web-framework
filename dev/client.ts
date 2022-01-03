import { RequestRestfulAPI, validations } from "./restful-api-frontend-declaration"
import { ApiAccessorFetch } from '../dist/browser'

const apiAccessor = new ApiAccessorFetch(validations)

const requestRestfulAPI: RequestRestfulAPI = apiAccessor.requestRestfulAPI

requestRestfulAPI('GET', '/api/blogs/{id}', { path: { id: 1 } })
