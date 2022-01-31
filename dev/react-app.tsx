import * as ReactDOM from 'react-dom'
import React from "react"
import { routes } from './generated/router-declaration'
import { matchRoute, useLocation } from '@protocol-based-web-framework/router'
import { ConfirmMessageContext } from './shared/contexts'
import './generated/import-pages'

function App() {
  const confirmMessage = React.useRef('')
  const [location] = useLocation(React, {
    confirm: () => confirmMessage.current ? confirm(confirmMessage.current) : true,
  })
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (confirmMessage.current) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    addEventListener('beforeunload', handleBeforeUnload)
    return () => removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  for (const route of routes) {
    if (route.Component) {
      const result = matchRoute(location, route)
      if (result !== false) {
        if (typeof result === 'string') {
          return <>{result}</>
        }
        return (
          <ConfirmMessageContext.Provider value={confirmMessage}>
            <route.Component {...result} />
          </ConfirmMessageContext.Provider>
        )
      }
    }
  }
  return null
}

ReactDOM.render(<App />, document.querySelector('#container'))
