import { composeUrl, ApiValidation, ApiAccessorBase } from './api-access-lib'

/**
 * @public
 */
export class ApiAccessorFetch<T extends ApiValidation> extends ApiAccessorBase<T> {
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
        const formData = new FormData()
        for (const key in args.body) {
          formData.append(key, (args.body as { [key: string]: string | Blob })[key])
        }
        body = formData
      } else {
        body = JSON.stringify(args.body)
        headers = { 'content-type': 'application/json' }
      }
    }
    const result = await fetch(
      composedUrl,
      {
        method,
        body,
        headers,
      })
    const contentType = result.headers.get('content-type')
    if (contentType) {
      const ignoredFields = args?.query?.ignoredFields as string[] | undefined
      const pickedFields = args?.query?.pickedFields as string[] | undefined
      if (contentType.includes('application/json')) {
        const json = await result.json()
        this.validateByJsonSchema(method, url, ignoredFields, pickedFields, json)
        return json
      }
      if (contentType.includes('text/')) {
        const text = await result.text()
        this.validateByJsonSchema(method, url, ignoredFields, pickedFields, text)
        return text
      }
    }
    return result.blob()
  }
}
