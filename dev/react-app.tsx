import * as ReactDOM from 'react-dom'
import React from "react"
import { routes } from './generated/router-declaration'
import { matchRoute, useLocation } from '@protocol-based-web-framework/router'
import { BlogPageContext, ConfirmMessageContext } from './shared/contexts'
import './generated/import-pages'
import './shared/local-storage'
import { Blog } from './blog/blog.schema'

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

  const blogData = React.useRef<Blog>()

  for (const route of routes) {
    if (route.Component) {
      const result = matchRoute(location, route)
      if (result !== false) {
        if (typeof result === 'string') {
          return <>{result}</>
        }
        return (
          <ConfirmMessageContext.Provider value={confirmMessage}>
            <BlogPageContext.Provider value={blogData}>
              <route.Component {...result} />
            </BlogPageContext.Provider>
          </ConfirmMessageContext.Provider>
        )
      }
    }
  }
  return null
}

ReactDOM.render(<App />, document.querySelector('#container'))
