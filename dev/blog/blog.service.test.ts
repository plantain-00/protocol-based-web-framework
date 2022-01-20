import test from 'ava'
import { getBlogs } from './blog.service.js'

test('create blog', async (t) => {
  const blog = await getBlogs({
    query: {
      skip: 0,
      take: 10,
      sortField: 'content',
      sortType: 'asc',
    },
    cookie: {
      myUserId: 1,
    },
  })
  t.snapshot(blog)

  const blog2 = await getBlogs({
    query: {
      skip: 0,
      take: 10,
      sortField: 'content',
      sortType: 'asc',
      ignoredFields: ['meta'],
    },
    cookie: {
      myUserId: 1,
    },
  })
  t.snapshot(blog2)

  const blog3 = await getBlogs({
    query: {
      skip: 0,
      take: 10,
      sortField: 'content',
      sortType: 'asc',
      ignoredFields: ['posts'],
    },
    cookie: {
      myUserId: 1,
    },
  })
  t.snapshot(blog3)

  const blog4 = await getBlogs({
    query: {
      skip: 0,
      take: 10,
      sortField: 'content',
      sortType: 'asc',
      ignoredFields: ['posts', 'meta'],
    },
    cookie: {
      myUserId: 1,
    },
  })
  t.snapshot(blog4)
})
