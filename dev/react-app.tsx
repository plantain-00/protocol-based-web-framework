import * as ReactDOM from 'react-dom'
import React from "react"
import { Route, Link, useParams, Routes, BrowserRouter } from 'react-router-dom'
import { requestRestfulAPI } from './client-fetch'
import { Blog } from './restful-api-schema'
import { bindRouterComponent, GetPageUrl, routes } from './router-declaration'
import { composeUrl } from '../dist/browser'

const getPageUrl: GetPageUrl = composeUrl

function HomePage() {
  const [blogs, setBlogs] = React.useState<Blog[]>([])
  React.useEffect(() => {
    requestRestfulAPI('GET', '/api/blogs').then((b) => {
      setBlogs(b.result)
    })
  }, [])

  return (
    <div>
      <div>blogs</div>
      <ul>
        {blogs.map((blog) => <li key={blog.id}><Link to={getPageUrl('/blogs/{id}', { path: { id: blog.id } })}>{blog.content}</Link></li>)}
      </ul>
    </div>
  )
}
bindRouterComponent('HomePage', HomePage)

function BlogPage() {
  const params = useParams<'id'>()
  const [blog, setBlog] = React.useState<Blog>()
  React.useEffect(() => {
    requestRestfulAPI('GET', `/api/blogs/${+params.id!}`).then((b) => {
      setBlog(b.result)
    })
  }, [])
  return (
    <div>
      <div >
        <Link to={getPageUrl('/')}>back to app</Link>
      </div>
      <div >blog {params.id}</div>
      <div>{blog?.content}</div>
    </div >
  )
}
bindRouterComponent('BlogPage', BlogPage)

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {routes.map(({ path, Component }) => {
          if (Component) {
            return <Route path={path} element={<Component />} />
          }
          return null
        })}
      </Routes>
    </BrowserRouter>
  )
}

ReactDOM.render(<App />, document.querySelector('#container'))
