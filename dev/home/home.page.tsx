import React from "react"
import { requestRestfulAPI } from '../api/fetch.service'
import { Blog } from '../blog/blog.schema'
import { bindRouterComponent } from '../generated/router-declaration'
import { navigateTo } from '@protocol-based-web-framework/router'
import { getPageUrl } from '../shared/page-url'
import { HomePageProps } from "./home.schema"
import { BlogPageContext } from "../shared/contexts"

function HomePage(props: HomePageProps) {
  const blogData = React.useContext(BlogPageContext)
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
              blogData.current = blog
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
bindRouterComponent('/', HomePage)
