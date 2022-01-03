import Ajv, { ValidateFunction } from 'ajv'
import type { Application, Request, Response } from 'express'
import type { Readable } from 'stream'

/**
 * @public
 */
export const ajvBackend = new Ajv({
  removeAdditional: true,
  useDefaults: true,
  coerceTypes: true,
})

/**
 * @public
 */
export type HandleHttpRequest = (
  app: Application,
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  url: string,
  tags: string[],
  validate: ValidateFunction,
  handler: (input: any) => Promise<{} | Readable>
) => void

/**
 * @public
 */
export function getAndValidateRequestInput(req: Request<{}, {}, {}>, validate: ValidateFunction<unknown>) {
  const body: { [key: string]: unknown } = req.body
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    for (const file of req.files) {
      body[file.fieldname] = file.stream
    }
  }
  const input = { path: req.params, query: req.query, body }
  return validate(input) ? input : (validate.errors?.[0]?.message ?? input)
}

/**
 * @public
 */
export function respondHandleResult(result: {} | Readable, req: Request<{}, {}, {}>, res: Response<{}>) {
  if (result !== null &&
    typeof result === 'object' &&
    typeof (result as Readable).pipe === 'function'
  ) {
    if (typeof req.query.attachmentFileName === 'string') {
      if (req.query.attachmentFileName) {
        res.set({
          'Content-Disposition': `attachment; filename="${req.query.attachmentFileName}"`,
        })
      } else {
        res.set({
          'Content-Disposition': 'attachment',
        })
      }
    }
    (result as Readable).pipe(res)
  } else if (typeof result === 'string') {
    res.set({
      'content-type': 'text/plain; charset=UTF-8',
    })
    res.send(result).end()
  } else {
    res.json(result)
  }
}
