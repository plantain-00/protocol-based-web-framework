import { 博客页 } from '../blog/blog.page.story'
import BlogDownloadBlogComponentStory from '../blog/download-blog.component.story'

export const stories = [
  {
    path: 'blog/blog.page.story',
    name: '博客页',
    Component: 博客页,
    code: '() => ' + "{\n  return (\n    <BlogPage path={{ id: 123 }} />\n  )\n}",
    props: [
      {
        "name": "path",
        "type": "{ id: number }",
        "optional": false,
        "description": ""
      }
    ],
    componentName: 'BlogPage',
    parentComponentName: '',
  },
  {
    path: 'blog/download-blog.component.story',
    name: '',
    Component: BlogDownloadBlogComponentStory,
    code: '() => ' + "{\n  return (\n    <DownloadBlog id={1} />\n  )\n}",
    props: [
      {
        "name": "id",
        "type": "number",
        "optional": false,
        "description": "blog id"
      }
    ],
    componentName: 'DownloadBlog',
    parentComponentName: 'BlogPage',
  },
]
