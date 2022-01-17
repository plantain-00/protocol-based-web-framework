import React from "react"
import { requestRestfulAPI } from '../api/fetch.service'
import { Blog } from '../blog/blog.schema'
import { bindRouterComponent, BlogPageProps } from '../router-declaration'
import { navigateTo } from '../../dist/browser'
import { ConfirmMessageContext, getPageUrl } from '../router.service'

function BlogPage(props: BlogPageProps) {
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
      <div onClick={() => navigateTo(getPageUrl('/'))}>
        back to app
      </div>
      <div >blog {props.path.id}</div>
      <div>{blog?.content}</div>
    </div >
  )
}
bindRouterComponent('BlogPage', BlogPage)