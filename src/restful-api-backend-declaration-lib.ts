import Ajv, { ValidateFunction } from 'ajv'
import type { Application } from 'express'
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
  tag: string,
  validate: ValidateFunction,
  handler: (input: any) => Promise<{} | Readable>
) => void
