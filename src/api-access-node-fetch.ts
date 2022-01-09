import type { RequestInfo, RequestInit, Response, BodyInit, HeadersInit } from 'node-fetch'
import type NodeFormData = require('form-data')
import { composeUrl, ApiValidation, ApiAccessorBase } from './api-access-lib'

/**
 * @public
 */
export class ApiAccessorNodeFetch<T extends ApiValidation> extends ApiAccessorBase<T> {
  constructor(
    validations: T[],
    private fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
    private FormData: typeof NodeFormData,
  ) {
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
    let body: BodyInit | undefined
    let headers: HeadersInit | undefined
    if (args?.body) {
      if (typeof args.body === 'object' && Object.values(args.body).some((b) => b instanceof Blob)) {
        const formData = new this.FormData()
        for (const key in args.body) {
          formData.append(key, (args.body as { [key: string]: string | Blob })[key])
        }
        body = formData
      } else {
        body = JSON.stringify(args.body)
        headers = { 'content-type': 'application/json' }
      }
    }
    const result = await this.fetch(
      composedUrl,
      {
        method,
        body,
        headers,
      })
    return this.getDataFromFetchResponse(result, method, url, args)
  }
}
