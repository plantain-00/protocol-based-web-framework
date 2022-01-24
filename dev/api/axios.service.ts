import Axios from 'axios'
import { GetRequestApiUrl, RequestRestfulAPI, validations } from "../generated/restful-api-frontend-declaration"
import { ApiAccessorAxios, composeUrl } from '../../dist/browser'

const apiAccessor = new ApiAccessorAxios(validations, Axios)

export const getRequestApiUrl: GetRequestApiUrl = composeUrl
export const requestRestfulAPI: RequestRestfulAPI = apiAccessor.requestRestfulAPI
