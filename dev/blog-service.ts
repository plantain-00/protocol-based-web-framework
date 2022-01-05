import { RowFilterOptions } from '../dist/nodejs'
import { tableSchemas } from './db-declaration'
import { bindRestfulApiHandler, CreateBlog, DeleteBlog, GetBlogById, GetBlogs, PatchBlog } from './restful-api-backend-declaration'
import { Blog, BlogIgnorableField } from './restful-api-schema'
import { BlogSchema } from './db-schema'
import { countRow, deleteRow, getRow, insertRow, selectRow, updateRow } from './db-service'

export const getBlogs: GetBlogs = async ({ query: { sortField, sortType, content, skip, take, ignoredFields, pickedFields } }) => {
  const filter: RowFilterOptions<BlogSchema> = {
    fuzzyFilter: {
      content,
    },
  }
  const filteredBlogs = await selectRow('blogs', {
    ...filter,
    sort: [
      {
        field: sortField,
        type: sortType,
      }
    ],
    ...extractBlogDbFilteredFields({ ignoredFields, pickedFields }),
    pagination: {
      take,
      skip,
    },
  })
  const total = await countRow('blogs', filter)

  return {
    result: await Promise.all(filteredBlogs.map((blog) => getBlogFilteredFields(blog, { ignoredFields, pickedFields }))),
    count: total,
  }
}
bindRestfulApiHandler('GetBlogs', getBlogs)

export const getBlogById: GetBlogById = async ({ query, path: { id } }) => {
  const blog = await getRow('blogs', { filter: { id }, ...extractBlogDbFilteredFields(query) })
  return {
    result: blog ? await getBlogFilteredFields(blog, query) : undefined
  }
}
bindRestfulApiHandler('GetBlogById', getBlogById)

export const createBlog: CreateBlog = async ({ query, body: { content } }) => {
  if (!content) {
    throw new HttpError('invalid parameter: content', 400)
  }
  const blog = await insertRow('blogs', {
    id: Math.round(Math.random() * 10000),
    content,
    meta: {
      baz: 222
    },
  })
  return {
    result: await getBlogFilteredFields(blog, query)
  }
}
bindRestfulApiHandler('CreateBlog', createBlog)

export const patchBlog: PatchBlog = async ({ path: { id }, query, body }) => {
  await updateRow('blogs', body, { filter: { id } })
  const blog = await getRow('blogs', { filter: { id }, ...extractBlogDbFilteredFields(query) })
  if (!blog) {
    throw new HttpError('invalid parameter: id', 400)
  }
  return {
    result: await getBlogFilteredFields(blog, query)
  }
}
bindRestfulApiHandler('PatchBlog', patchBlog)

export const deleteBlog: DeleteBlog = async ({ path: { id } }) => {
  await deleteRow('blogs', { filter: { id } })
  return {}
}
bindRestfulApiHandler('DeleteBlog', deleteBlog)

export class HttpError extends Error {
  constructor(message: string, public statusCode = 500) {
    super(message)
  }
}

function extractBlogDbFilteredFields<TIgnored extends BlogIgnorableField = never, TPicked extends keyof Blog = keyof Blog>(
  filter?: Partial<{
    ignoredFields: TIgnored[]
    pickedFields: TPicked[]
  }>,
) {
  const result: {
    ignoredFields?: Extract<BlogIgnorableField, keyof BlogSchema>[]
    pickedFields?: (keyof BlogSchema)[]
  } = {}
  if (filter?.ignoredFields) {
    const ignoredFields: Extract<BlogIgnorableField, keyof BlogSchema>[] = []
    for (const item of filter.ignoredFields) {
      for (const r of tableSchemas.blogs.fieldNames) {
        if (item === r) {
          ignoredFields.push(item)
          break
        }
      }
    }
    result.ignoredFields = ignoredFields
  }
  if (filter?.pickedFields) {
    const pickedFields: (keyof BlogSchema)[] = []
    for (const item of filter.pickedFields) {
      for (const r of tableSchemas.blogs.fieldNames) {
        if (item === r) {
          pickedFields.push(item)
          break
        }
      }
    }
    result.pickedFields = pickedFields
  }
  return result
}

async function getBlogFilteredFields<TIgnored extends BlogIgnorableField = never, TPicked extends keyof Blog = keyof Blog>(
  blog: Partial<BlogSchema>,
  filter?: Partial<{
    ignoredFields: TIgnored[]
    pickedFields: TPicked[]
  }>
) {
  const ignoredFields: BlogIgnorableField[] | undefined = filter?.ignoredFields
  const pickedFields: (keyof Blog)[] | undefined = filter?.pickedFields
  const isIncluded = (field: Extract<BlogIgnorableField, keyof Blog>) => (!pickedFields || pickedFields.includes(field)) && !ignoredFields?.includes(field)
  return {
    ...blog,
    posts: !isIncluded('posts') ? undefined : await selectRow('posts', { filter: { blogId: blog.id } }),
    meta: !isIncluded('meta') ? undefined : blog.meta,
  } as Omit<Pick<Blog, TPicked>, TIgnored>
}
