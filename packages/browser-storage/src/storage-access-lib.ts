import Ajv, { ValidateFunction } from 'ajv'

/**
 * @public
 */
export const ajv = new Ajv()

export interface StorageValidation {
  key: string
  validate: ValidateFunction<unknown>
}
