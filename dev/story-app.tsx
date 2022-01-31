import * as ReactDOM from 'react-dom'
import React from "react"
import './vender/prism'
import './vender/prism.css'

import { navigateTo, useLocation } from '@protocol-based-web-framework/router'
import { stories } from './generated/import-stories'

function StoryApp() {
  const [, search] = useLocation(React)
  if (!search) {
    return (
      <ul>
        {stories.map((s) => <li key={s.path} onClick={() => navigateTo('/?p=' + s.path)}>{s.name} {s.path}</li>)}
      </ul>
    )
  }
  const path = search.substring('?p='.length)
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
      <code ref={ref} className="language-typescript">
        {props.code}
      </code>
    </pre>
  )
}

ReactDOM.render(<StoryApp />, document.querySelector('#container'))

declare global {
  const Prism: {
    highlightElement(element: HTMLElement): void
  }
} 
