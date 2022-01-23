import * as ReactDOM from 'react-dom'
import React from "react"
import Prism from 'prismjs'

import { navigateTo, useLocation } from '../dist/browser'
import { stories } from './generated/import-stories'

function StoryApp() {
  const location = useLocation(React)
  if (location === '/') {
    return (
      <ul>
        {stories.map((s) => <li key={s.path} onClick={() => navigateTo('/' + s.path)}>{s.path}</li>)}
      </ul>
    )
  }
  const path = location.substring(1)
  for (const story of stories) {
    if (path === story.path) {
      return (
        <div>
          <story.Component />
          <HighlightCode code={story.code} />
        </div>
      )
    }
  }
  return null
}

function HighlightCode(props: { code: string }) {
  const ref = React.useRef<HTMLElement | null>(null)
  React.useEffect(() => {
    if (ref.current) {
      Prism.highlightElement(ref.current)
    }
  }, [props.code, ref.current])
  return (
    <pre>
      <code ref={ref} className="language-javascript">
        {props.code}
      </code>
    </pre>
  )
}

ReactDOM.render(<StoryApp />, document.querySelector('#container'))
