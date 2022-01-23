import BlogBlogPageStory from '../blog/blog.page.story'

export const stories = [
  {
    path: 'blog/blog.page.story',
    Component: BlogBlogPageStory,
    code: `() => {
    return (<BlogPage path={{ id: 123 }}/>);
}`,
  },
]
