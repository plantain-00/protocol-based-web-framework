import * as ReactDOM from 'react-dom'
import React from "react"
import { requestRestfulAPI } from './client-fetch'
import { Blog } from './restful-api-schema'
import { bindRouterComponent, GetPageUrl, routes, BlogPageProps, HomePageProps } from './router-declaration'
import { composeUrl, matchRoute, useLocation, navigateTo } from '../dist/browser'

const getPageUrl: GetPageUrl = composeUrl

function HomePage(props: HomePageProps) {
  const [blogs, setBlogs] = React.useState<Blog[]>([])
  React.useEffect(() => {
    requestRestfulAPI('GET', '/api/blogs', { query: { skip: (props.query.page - 1) * 10 } }).then((b) => {
      setBlogs(b.result)
    })
  }, [props.query.page])

  return (
    <div>
      <div>blogs</div>
      <ul>
        {blogs.map((blog) => (
          <li
            key={blog.id}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              navigateTo(getPageUrl('/blogs/{id}', { path: { id: blog.id } }))
            }}
          >
            {blog.content}
          </li>
        ))}
      </ul>
      <button
        onClick={() => {
          navigateTo(getPageUrl('/', { query: { page: props.query.page - 1 } }))
        }}
      >
        previous page
      </button>
      {props.query.page}
      <button
        onClick={() => {
          navigateTo(getPageUrl('/', { query: { page: props.query.page + 1 } }))
        }}
      >
        next page
      </button>
    </div>
  )
}
bindRouterComponent('HomePage', HomePage)

function BlogPage(props: BlogPageProps) {
  const [blog, setBlog] = React.useState<Blog>()
  React.useEffect(() => {
    requestRestfulAPI('GET', `/api/blogs/${props.path.id}`).then((b) => {
      setBlog(b.result)
    })
  }, [])
  return (
    <div>
      <div onClick={() => navigateTo(getPageUrl('/'))}>
        back to app
      </div>
      <div >blog {props.path.id}</div>
      <div>{blog?.content}</div>
    </div >
  )
}
bindRouterComponent('BlogPage', BlogPage)

function App() {
  const location = useLocation(React)

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
