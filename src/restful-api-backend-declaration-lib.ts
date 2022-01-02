import Ajv, { ValidateFunction } from 'ajv'
import { Application } from 'express'
import { Readable } from 'stream'

/**
 * @public
 */
export const ajv = new Ajv({
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
  handler: (input: unknown) => Promise<{} | Readable>
) => void
