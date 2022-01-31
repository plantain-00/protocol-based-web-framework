import Ajv from 'ajv'

/**
 * @public
 */
export const ajv = new Ajv({
  removeAdditional: true,
  useDefaults: true,
  coerceTypes: true,
})
