import { GetRequestApiUrl, RequestRestfulAPI, validations } from "../generated/restful-api-frontend-declaration"
import { ApiAccessorFetch, composeUrl } from '@protocol-based-web-framework/restful-api-consumer'

const apiAccessor = new ApiAccessorFetch(validations)

export const requestRestfulAPI: RequestRestfulAPI = apiAccessor.requestRestfulAPI
export const getRequestApiUrl: GetRequestApiUrl = composeUrl
