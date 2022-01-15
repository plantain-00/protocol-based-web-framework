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

const positionLastShownKey = 'positionLastShown'
const positionMaxKey = 'positionMax'

/**
 * @public
 */
export function navigateTo(to: string, replace?: boolean) {
  const method = replace ? 'replaceState' : 'pushState'
  const position = Number(sessionStorage.getItem(positionMaxKey)) + 1
  sessionStorage.setItem(positionMaxKey, String(position))
  sessionStorage.setItem(positionLastShownKey, String(position))
  history[method](position, '', to)
  dispatchEvent(new Event(method))
}

function undoPopStateChange() {
  const positionLastShown = Number(sessionStorage.getItem(positionLastShownKey))
  if (history.state > positionLastShown) {
    history.back()
  } else if (history.state < positionLastShown) {
    history.forward()
  }
}

function getLocation() {
  return {
    path: location.pathname || '/',
    search: location.search,
  }
}

/**
 * @public
 */
export function useLocation(
  React: { useEffect: typeof useEffect, useRef: typeof useRef, useState: typeof useState },
  options?: Partial<{
    confirm: () => boolean | Promise<boolean>
  }>
) {
  const [{ path, search }, update] = React.useState(() => getLocation())
  const prevHash = React.useRef(path + search)
  React.useEffect(() => {
    const handlePushOrReplaceState = () => {
      const newLocation = getLocation()
      const hash = newLocation.path + newLocation.search
      if (prevHash.current !== hash) {
        prevHash.current = hash
        update(newLocation)
      }
    }
    const handlePopState = async () => {
      const newLocation = getLocation()
      const hash = newLocation.path + newLocation.search
      if (prevHash.current !== hash) {
        let confirmed = true
        if (options?.confirm) {
          confirmed = await options.confirm()
        }
        if (confirmed) {
          sessionStorage.setItem(positionLastShownKey, String(history.state))
          prevHash.current = hash
          update(newLocation)
        } else {
          undoPopStateChange()
        }
      }
    }
    addEventListener('popstate', handlePopState)
    addEventListener('replaceState', handlePushOrReplaceState)
    addEventListener('pushState', handlePushOrReplaceState)
    handlePushOrReplaceState()
    return () => {
      removeEventListener('popstate', handlePopState)
      removeEventListener('replaceState', handlePushOrReplaceState)
      removeEventListener('pushState', handlePushOrReplaceState)
    }
  }, [])
  return path
}
