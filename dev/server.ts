import * as sqlite from 'sqlite3'
import express from 'express'
import * as bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import { RowFilterOptions, SqliteAccessor, HandleHttpRequest, getAndValidateRequestInput, respondHandleResult } from '../dist/nodejs'
import { CountRow, DeleteRow, GetRow, InsertRow, SelectRow, tableNames, tableSchemas, UpdateRow } from './db-declaration'
import { CreateBlog, DeleteBlog, GetBlogById, GetBlogs, PatchBlog, registerCreateBlog, registerDeleteBlog, registerGetBlogById, registerGetBlogs, registerPatchBlog } from './restful-api-backend-declaration'
import { Blog, BlogIgnorableField } from './restful-api-schema'
import { BlogSchema } from './db-schema'

const sqliteAccessor = new SqliteAccessor(new sqlite.Database(':memory:'), tableSchemas)
const insertRow: InsertRow = sqliteAccessor.insertRow
const updateRow: UpdateRow = sqliteAccessor.updateRow
const getRow: GetRow = sqliteAccessor.getRow
const selectRow: SelectRow = sqliteAccessor.selectRow
const deleteRow: DeleteRow = sqliteAccessor.deleteRow
const countRow: CountRow = sqliteAccessor.countRow

export async function start() {
  for (const tableName of tableNames) {
    await sqliteAccessor.createTable(tableName)
  }

  await insertRow('blogs', { id: 1, content: 'blog 1 content', meta: { foo: 'bar' } })
  await insertRow('blogs', { id: 2, content: 'blog 2 content', meta: { bar: 123 } })

  await insertRow('posts', { id: 11, content: 'post 11 content', blogId: 1 })
  await insertRow('posts', { id: 12, content: 'post 12 content', blogId: 1 })
  await insertRow('posts', { id: 13, content: 'post 13 content', blogId: 1 })
  await insertRow('posts', { id: 21, content: 'post 21 content', blogId: 2 })
  await insertRow('posts', { id: 22, content: 'post 22 content', blogId: 2 })
  await insertRow('posts', { id: 23, content: 'post 23 content', blogId: 2 })

  await updateRow('blogs', { content: 'new content' }, { filter: { id: 1 } })
  await getRow('blogs', { filter: { content: 'new content' } })
  await selectRow('posts', { filter: { blogId: 1 }, pagination: { take: 10, skip: 10 }, sort: [{ field: 'id', type: 'asc' }] })
  await countRow('posts', { filter: { blogId: 1 } })
  await deleteRow('blogs', { filter: { id: 1 } })

  const app = express()
  app.use(bodyParser.json())
  app.use(cookieParser())
  registerGetBlogs(app, handleHttpRequest, getBlogs)
  registerGetBlogById(app, handleHttpRequest, getBlogById)
  registerCreateBlog(app, handleHttpRequest, createBlog)
  registerPatchBlog(app, handleHttpRequest, patchBlog)
  registerDeleteBlog(app, handleHttpRequest, deleteBlog)
  app.listen(3000)
}

const getBlogs: GetBlogs = async ({ query: { sortField, sortType, content, skip, take, ignoredFields } }) => {
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
    ignoredFields: extractDbIgnoredFieldsFromBlogIgnoredField(ignoredFields),
    pagination: {
      take,
      skip,
    },
  })
  const total = await countRow('blogs', filter)

  return {
    result: await Promise.all(filteredBlogs.map((blog) => getBlogWithoutIngoredFields(blog, ignoredFields))),
    count: total,
  }
}

const getBlogById: GetBlogById = async ({ query, path: { id } }) => {
  const blog = await getRow('blogs', { filter: { id }, ignoredFields: extractDbIgnoredFieldsFromBlogIgnoredField(query?.ignoredFields) })
  return {
    result: blog ? await getBlogWithoutIngoredFields(blog, query?.ignoredFields) : undefined
  }
}

const createBlog: CreateBlog = async ({ query, body: { content } }) => {
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
    result: await getBlogWithoutIngoredFields(blog, query?.ignoredFields)
  }
}

const patchBlog: PatchBlog = async ({ path: { id }, query, body }) => {
  await updateRow('blogs', body, { filter: { id } })
  const blog = await getRow('blogs', { filter: { id }, ignoredFields: extractDbIgnoredFieldsFromBlogIgnoredField(query?.ignoredFields) })
  if (!blog) {
    throw new HttpError('invalid parameter: id', 400)
  }
  return {
    result: await getBlogWithoutIngoredFields(blog, query?.ignoredFields)
  }
}

const deleteBlog: DeleteBlog = async ({ path: { id } }) => {
  await deleteRow('blogs', { filter: { id } })
  return {}
}

const handleHttpRequest: HandleHttpRequest = (app, method, url, tags, validate, handler) => {
  app[method](url, async (req: express.Request<{}, {}, {}>, res: express.Response<{}>) => {
    try {
      const input = getAndValidateRequestInput(req, validate, { myUserId: req.cookies.sid })
      if (typeof input === 'string') {
        throw new HttpError(input, 400)
      }
      const result = await handler(input)
      respondHandleResult(result, req, res)
    } catch (error: unknown) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500
      const message = error instanceof Error ? error.message : error
      res.status(statusCode).json({ message }).end()
    }
  })
}

class HttpError extends Error {
  constructor(message: string, public statusCode = 500) {
    super(message)
  }
}

type BlogDbIgnorableField = Extract<BlogIgnorableField, keyof BlogSchema>

function extractDbIgnoredFieldsFromBlogIgnoredField(ignoredFields?: BlogIgnorableField[]) {
  if (!ignoredFields) {
    return undefined
  }
  const result: BlogDbIgnorableField[] = []
  for (const item of ignoredFields) {
    for (const r of tableSchemas.blogs.fieldNames) {
      if (item === r) {
        result.push(item)
        break
      }
    }
  }
  return result
}

async function getBlogWithoutIngoredFields<T extends BlogIgnorableField = never>(
  blog: Pick<Partial<Blog>, BlogDbIgnorableField> & Omit<BlogSchema, BlogDbIgnorableField>,
  ignoredFields?: T[],
) {
  const fields: BlogIgnorableField[] | undefined = ignoredFields
  return {
    ...blog,
    posts: fields?.includes('posts') ? undefined : await selectRow('posts', { filter: { blogId: blog.id } }),
    meta: fields?.includes('meta') ? undefined : blog.meta,
  } as Omit<Blog, T>
}

start()
