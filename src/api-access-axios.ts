import type { AxiosStatic, AxiosRequestHeaders, AxiosResponse } from 'axios'
import { composeUrl, ApiValidation, ApiAccessorBase } from './api-access-lib'

/**
 * @public
 */
export class ApiAccessorAxios<T extends ApiValidation> extends ApiAccessorBase<T> {
  constructor(validations: T[], private axios: AxiosStatic) {
    super(validations)
  }
  public requestRestfulAPI = async (
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    args?: {
      path?: Record<string, string | number>,
      query?: Record<string, unknown>,
      body?: {}
    }
  ) => {
    const composedUrl = composeUrl(url, args)
    let body: unknown | undefined
    let headers: AxiosRequestHeaders | undefined
    if (args?.body) {
      if (typeof args.body === 'object' && Object.values(args.body).some((b) => b instanceof Blob)) {
        const formData = new FormData()
        for (const key in args.body) {
          formData.append(key, (args.body as { [key: string]: string | Blob })[key])
        }
        body = formData
      } else {
        body = args.body
        headers = { 'content-type': 'application/json' }
      }
    }
    const result = await this.axios.request<unknown, AxiosResponse<unknown, unknown>, unknown>(
      {
        url: composedUrl,
        method,
        data: body,
        headers,
      })
    const contentType = result.headers['content-type']
    if (contentType) {
      const ignoredFields = args?.query?.ignoredFields as string[] | undefined
      const pickedFields = args?.query?.pickedFields as string[] | undefined
      if (contentType.includes('application/json')) {
        const json = result.data
        this.validateByJsonSchema(method, url, ignoredFields, pickedFields, json)
        return json
      }
      if (contentType.includes('text/')) {
        const text = result.data
        this.validateByJsonSchema(method, url, ignoredFields, pickedFields, text)
        return text
      }
    }
    return result.data as any
  }
}
