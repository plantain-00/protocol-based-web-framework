import * as fs from 'fs'
import * as path from 'path'
import { RowFilterOptions } from '../dist/nodejs'
import { tableSchemas } from './db-declaration'
import { bindRestfulApiHandler, CreateBlog, DeleteBlog, DownloadBlog, GetBlogById, GetBlogs, GetBlogText, PatchBlog, UploadBlog } from './restful-api-backend-declaration'
import { Blog, BlogIgnorableField } from './restful-api-schema'
import { BlogSchema } from './db-schema'
import { countRow, deleteRow, getRow, insertRow, selectRow, updateRow } from './sqlite-service'

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
  const blog = {
    id: Math.round(Math.random() * 10000),
    content,
    meta: {
      baz: 222
    },
  }
  await insertRow('blogs', blog)
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

const downloadBlog: DownloadBlog = async ({ path: { id } }) => {
  console.info(id)
  return fs.createReadStream(path.resolve(process.cwd(), 'README.md'))
}
bindRestfulApiHandler('DownloadBlog', downloadBlog)

const uploadBlog: UploadBlog = async ({ body: { file, id } }) => {
  console.info(id)
  file.pipe(fs.createWriteStream('a.png'))
  return {}
}
bindRestfulApiHandler('UploadBlog', uploadBlog)

const getBlogText: GetBlogText = async ({ path: { id } }) => {
  console.info(id)
  return fs.readFileSync(path.resolve(process.cwd(), 'README.md')).toString()
}
bindRestfulApiHandler('GetBlogText', getBlogText)

export class HttpError extends Error {
  constructor(message: string, public statusCode = 500) {
    super(message)
  }
}

function extractBlogDbFilteredFields(filter?: Partial<{ ignoredFields?: string[], pickedFields?: string[] }>) {
  return {
    ignoredFields: filter?.ignoredFields ? tableSchemas.blogs.fieldNames.filter((f): f is Extract<BlogIgnorableField, keyof BlogSchema> => !!filter?.ignoredFields?.includes(f)) : undefined,
    pickedFields: filter?.pickedFields ? tableSchemas.blogs.fieldNames.filter((f) => !!filter?.pickedFields?.includes(f)) : undefined,
  }
}

async function getBlogFilteredFields<TIgnored extends BlogIgnorableField = never, TPicked extends keyof Blog = keyof Blog>(
  blog: Partial<BlogSchema>,
  filter?: Partial<{ ignoredFields: BlogIgnorableField[], pickedFields: (keyof Blog)[] }>
) {
  const isIncluded = (field: Extract<BlogIgnorableField, keyof Blog>) => (!filter?.pickedFields || filter.pickedFields.includes(field)) && !filter?.ignoredFields?.includes(field)
  return {
    ...blog,
    posts: !isIncluded('posts') ? undefined : await selectRow('posts', { filter: { blogId: blog.id } }),
    meta: !isIncluded('meta') ? undefined : blog.meta,
  } as Omit<Pick<Blog, TPicked>, TIgnored>
}
