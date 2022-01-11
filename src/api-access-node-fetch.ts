import type { RequestInfo, RequestInit, Response, BodyInit, HeadersInit } from 'node-fetch'
import type NodeFormData = require('form-data')
import type { Readable } from 'stream'
import { composeUrl, ApiValidation, ApiAccessorBase } from './api-access-lib'
import { isReadable } from './utils'

/**
 * @public
 */
export class ApiAccessorNodeFetch<T extends ApiValidation> extends ApiAccessorBase<T> {
  constructor(
    validations: T[],
    private fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
    private FormData: typeof NodeFormData,
    private baseUrl: string,
    public headers?: HeadersInit
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
      if (typeof args.body === 'object' && Object.values(args.body).some((b) => isReadable(b) || b instanceof Buffer)) {
        const formData = new this.FormData()
        for (const key in args.body) {
          formData.append(key, (args.body as { [key: string]: string | Buffer | Readable })[key])
        }
        body = formData
      } else {
        body = JSON.stringify(args.body)
        headers = { 'content-type': 'application/json' }
      }
    }
    const result = await this.fetch(
      this.baseUrl + composedUrl,
      {
        method,
        body,
        headers: {
          ...headers,
          ...this.headers,
        },
      })
    return this.getDataFromFetchResponse(result, method, url, args)
  }
}
