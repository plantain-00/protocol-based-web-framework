import React from "react"
import { requestRestfulAPI } from '../api/fetch.service'
import { Blog, BlogPageProps } from '../blog/blog.schema'
import { bindRouterComponent } from '../generated/router-declaration'
import { navigateTo } from '@protocol-based-web-framework/router'
import { ConfirmMessageContext } from '../shared/contexts'
import { getPageUrl } from '../shared/page-url'
import { DownloadBlog } from "./download-blog.component"

export function BlogPage(props: BlogPageProps) {
  const [blog, setBlog] = React.useState<Blog>()
  const confirmMessage = React.useContext(ConfirmMessageContext)
  React.useEffect(() => {
    // eslint-disable-next-line plantain/promise-not-await
    requestRestfulAPI('GET', `/api/blogs/${props.path.id}`).then((b) => {
      setBlog(b.result)
    })
    confirmMessage.current = `exit ${props.path.id}?`
    return () => {
      confirmMessage.current = ''
    }
  }, [])
  return (
    <div>
      <DownloadBlog id={props.path.id} />
      <div onClick={() => navigateTo(getPageUrl('/'))}>
        back to app
      </div>
      <div >blog {props.path.id}</div>
      <div>{blog?.content}</div>
    </div >
  )
}
bindRouterComponent('/blogs/:id', BlogPage)
