import Ajv, { ValidateFunction } from 'ajv'
import qs from 'qs'

/**
 * @public
 */
export const ajvRouter = new Ajv({
  removeAdditional: true,
  useDefaults: true,
  coerceTypes: true,
})

/**
 * @public
 */
export interface Route {
  name: string
  path: string
  Component?: (props: { path?: unknown, query?: unknown }) => JSX.Element
  regexp?: RegExp
  keys: string[]
  validate: ValidateFunction<unknown>
}

/**
 * @public
 */
export function matchRoute(
  location: string,
  route: Route,
) {
  const { path, validate, regexp, keys } = route
  if (location === path) {
    return getAndValidateComponentProps(validate)
  }
  if (regexp && keys.length > 0) {
    const result = regexp.exec(location)
    if (result) {
      const path: Record<string, unknown> = {}
      keys.forEach((key, i) => {
        path[key] = result[i + 1]
      })
      return getAndValidateComponentProps(validate, path)
    }
  }
  return false
}

function getAndValidateComponentProps(
  validate: ValidateFunction<unknown>,
  path?: unknown,
) {
  const query = qs.parse(window.location.search.startsWith('?') ? window.location.search.substring(1) : window.location.search)
  const props = { path, query }
  return validate(props) ? props : (validate.errors?.[0]?.message ?? props)
}
