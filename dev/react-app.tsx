import * as ReactDOM from 'react-dom'
import React from "react"
import { useLocation } from "wouter"
import { requestRestfulAPI } from './client-fetch'
import { Blog } from './restful-api-schema'
import { bindRouterComponent, GetPageUrl, routes, BlogPageProps } from './router-declaration'
import { composeUrl, matchRoute } from '../dist/browser'

const getPageUrl: GetPageUrl = composeUrl

function HomePage() {
  const [blogs, setBlogs] = React.useState<Blog[]>([])
  const [, setLocation] = useLocation()
  React.useEffect(() => {
    requestRestfulAPI('GET', '/api/blogs').then((b) => {
      setBlogs(b.result)
    })
  }, [])

  return (
    <div>
      <div>blogs</div>
      <ul>
        {blogs.map((blog) => (
          <li
            key={blog.id}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setLocation(getPageUrl('/blogs/{id}', { path: { id: blog.id } }))
            }}
          >
            {blog.content}
          </li>
        ))}
      </ul>
    </div>
  )
}
bindRouterComponent('HomePage', HomePage)

function BlogPage(props: BlogPageProps) {
  const [blog, setBlog] = React.useState<Blog>()
  const [, setLocation] = useLocation()
  React.useEffect(() => {
    requestRestfulAPI('GET', `/api/blogs/${props.path.id}`).then((b) => {
      setBlog(b.result)
    })
  }, [])
  return (
    <div>
      <div onClick={() => setLocation(getPageUrl('/'))}>
        back to app
      </div>
      <div >blog {props.path.id}</div>
      <div>{blog?.content}</div>
    </div >
  )
}
bindRouterComponent('BlogPage', BlogPage)

function App() {
  const [location] = useLocation()

  for (const route of routes) {
    if (route.Component) {
      const result = matchRoute(location, route)
      if (result !== false) {
        if (typeof result === 'string') {
          return <>{result}</>
        }
        return <route.Component {...result} />
      }
    }
  }
  return null
}

ReactDOM.render(<App />, document.querySelector('#container'))
