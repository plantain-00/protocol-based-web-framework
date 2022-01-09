import produce from 'immer'
import qs from 'qs'
import type { ValidateFunction } from 'ajv'
import { ajvFrontend } from './restful-api-frontend-declaration-lib'

export function composeUrl(
  url: string,
  args?: { path?: Record<string, string | number>, query?: {} }
) {
  if (args?.path) {
    for (const key in args.path) {
      url = url.replace(`{${key}}`, args.path[key].toString())
    }
  }
  if (args?.query) {
    url += '?' + qs.stringify(args.query, {
      arrayFormat: 'brackets',
    })
  }
  return url
}

export interface ApiValidation {
  method: string
  url: string
  schema: {
    definitions: {
      [key: string]: {
        $ref?: string
        properties?: { [key: string]: unknown }
        required?: string[]
      }
    }
  }
  omittedReferences: string[]
  validate: ValidateFunction
  urlPattern?: RegExp
}

export class ApiAccessorBase<T extends ApiValidation> {
  constructor(private validations: T[]) { }

  protected validateByJsonSchema = (
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    ignoredFields: string[] | undefined,
    pickedFields: string[] | undefined,
    input: unknown,
  ) => {
    const validation = this.validations.find((v) => v.method === method && (v.url === url || v.urlPattern?.test(url)))
    if (validation) {
      if ((ignoredFields && ignoredFields.length > 0) || pickedFields) {
        const schemaWithoutIgnoredFields = produce(
          validation.schema,
          (draft) => {
            for (const omittedReference of validation.omittedReferences) {
              const properties = draft.definitions[omittedReference].properties
              if (properties) {
                if (ignoredFields) {
                  for (const ignoredField of ignoredFields) {
                    delete properties[ignoredField]
                  }
                }
                if (pickedFields) {
                  for (const key of Object.keys(properties)) {
                    if (!pickedFields.includes(key)) {
                      delete properties[key]
                    }
                  }
                }
              }
              const required = draft.definitions[omittedReference].required
              if (required) {
                draft.definitions[omittedReference].required = required.filter((r) => (!pickedFields || pickedFields.includes(r)) && !ignoredFields?.includes(r))
              }
            }
          }
        )
        ajvFrontend.validate(schemaWithoutIgnoredFields, input)
        if (ajvFrontend.errors?.[0]?.message) {
          throw new Error(ajvFrontend.errors[0].message)
        }
      } else {
        validation.validate(input)
        if (validation.validate.errors?.[0]?.message) {
          throw new Error(validation.validate.errors[0].message)
        }
      }
    }
  }
}
