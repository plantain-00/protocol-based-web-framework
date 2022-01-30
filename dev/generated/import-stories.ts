import { 博客页 } from '../blog/blog.page.story'
import BlogDownloadBlogComponentStory from '../blog/download-blog.component.story'

export const stories = [
  {
    path: 'blog/blog.page.story',
    name: '博客页',
    Component: 博客页,
    code: `() => {
    return (<BlogPage path={{ id: 123 }}/>);
}`,
  },
  {
    path: 'blog/download-blog.component.story',
    name: '',
    Component: BlogDownloadBlogComponentStory,
    code: `() => {
    return (<DownloadBlog id={1}/>);
}`,
  },
]
