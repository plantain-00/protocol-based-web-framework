import Ajv, { ValidateFunction } from 'ajv'
import qs from 'qs'
import type { useEffect, useRef, useState } from "react"

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

/**
 * @public
 */
export function navigateTo(to: string, replace?: boolean) {
  const method = replace ? 'replaceState' : 'pushState'
  history[method](null, '', to)
  dispatchEvent(new Event(method))
}

/**
 * @public
 */
export function useLocation(React: { useEffect: typeof useEffect, useRef: typeof useRef, useState: typeof useState }) {
  const [{ path, search }, update] = React.useState(() => ({
    path: location.pathname || '/',
    search: location.search,
  }))
  const prevHash = React.useRef(path + search)
  React.useEffect(() => {
    const checkForUpdates = () => {
      const path = location.pathname || '/'
      const search = location.search
      const hash = path + search
      if (prevHash.current !== hash) {
        prevHash.current = hash;
        update({ path, search })
      }
    };
    const events = ['popstate', 'replaceState', 'pushState']
    events.forEach((e) => addEventListener(e, checkForUpdates))
    checkForUpdates()
    return () => events.forEach((e) => removeEventListener(e, checkForUpdates))
  }, [])
  return path
}
