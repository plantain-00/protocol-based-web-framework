# protocol-based-web-framework

A protocol and code generation based web framework.

[![Dependency Status](https://david-dm.org/plantain-00/protocol-based-web-framework.svg)](https://david-dm.org/plantain-00/protocol-based-web-framework)
[![devDependency Status](https://david-dm.org/plantain-00/protocol-based-web-framework/dev-status.svg)](https://david-dm.org/plantain-00/protocol-based-web-framework#info=devDependencies)
[![Build Status: Windows](https://ci.appveyor.com/api/projects/status/github/plantain-00/protocol-based-web-framework?branch=master&svg=true)](https://ci.appveyor.com/project/plantain-00/protocol-based-web-framework/branch/master)
![Github CI](https://github.com/plantain-00/protocol-based-web-framework/workflows/Github%20CI/badge.svg)
[![npm version](https://badge.fury.io/js/protocol-based-web-framework.svg)](https://badge.fury.io/js/protocol-based-web-framework)
[![Downloads](https://img.shields.io/npm/dm/protocol-based-web-framework.svg)](https://www.npmjs.com/package/protocol-based-web-framework)
[![gzip size](https://img.badgesize.io/https://unpkg.com/protocol-based-web-framework?compression=gzip)](https://unpkg.com/protocol-based-web-framework)
[![type-coverage](https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fplantain-00%2Fprotocol-based-web-framework%2Fmaster%2Fpackage.json)](https://github.com/plantain-00/protocol-based-web-framework)

## install

`yarn add protocol-based-web-framework types-as-schema`

## features

### generating swagger for restful api

`./dev/swagger.json`

### type safe ignorable field in db access

```ts
const blog = await selectRow('blogs', {
  ignoredFields: ['content', 'meta'],
})
// sql: SELECT id FROM blogs
// blog: Omit<BlogSchema, "content" | "meta">[]
[
  {
    id: 1,
  },
  {
    id: 2,
  },
]
```

### type safe ignorable field in restful api backend access

```ts
const blog = await createBlog({
  body: {
    content: 'test'
  },
  query: {
    ignoredFields: ['posts', 'meta'],
  },
})
// blog: { result: Omit<Blog, "meta" | "posts"> }
{
  result: {
    content: 'test',
    id: 3,
    meta: undefined,
    posts: undefined,
  },
}
```

### type safe ignorable field in restful api frontend side access

```ts
const blogsResult = await requestRestfulAPI('GET', '/api/blogs', { query: { ignoredFields: ['posts', 'meta'] } })
// blogsResult: { result: Omit<Blog, "posts" | "meta">[] count: number; }
{
  result: [
    {
      content: 'test',
      id: 3,
    },
  ],
  count: 1,
}
```

### type safe requestRestfulAPI

```ts
await requestRestfulAPI('GET', `/api/blogs/1`)
await requestRestfulAPI('GET', `/api/blogs/abc`) // error
await requestRestfulAPI('GET', '/api/blogs/{id}', { path: { id: 1 } })
await requestRestfulAPI('GET', '/api/blogs/{id}', { path: { id: 'abc' } }) // error
```

### optional query population

```ts
async function getBlogWithoutIngoredFields<T extends BlogIgnorableField = never>(
  blog: Pick<Partial<Blog>, BlogDbIgnorableField> & Omit<BlogSchema, BlogDbIgnorableField>,
  ignoredFields?: T[],
) {
  const fields: BlogIgnorableField[] | undefined = ignoredFields
  return {
    ...blog,
    posts: fields?.includes('posts') ? undefined : await selectRow('posts', { filter: { blogId: blog.id } }), // ignored or populated
    meta: fields?.includes('meta') ? undefined : blog.meta,
  } as Omit<Blog, T>
}
```

### filters

```ts
await selectRow('blogs', {
  filter: {
    id: [1, 2],
    content: 'www',
  },
  fuzzyFilter: {
    content: 'abc',
  },
  rawFilter: {
    sql: '(id = ? OR content = ?)',
    value: [1, 'abc'],
  },
})
// SELECT id, content, meta FROM blogs WHERE id IN (?, ?) AND content = ? AND content LIKE '%' || ? || '%' AND (id = ? OR content = ?)
```

### request and response validation

```txt
curl -v http://localhost:3000/api/blogs/abc

HTTP/1.1 400 Bad Request
{"message":"must be number"}
```

### request normalization(remove additional fields, fill default value, type '123' -> 123)

```txt
curl -v http://localhost:3000/api/blogs?content=abc&foo=123&skip=10

{ content: 'abc', skip: 10, take: 10, sortField: 'id', sortType: 'asc' }
```

## usage

```ts
// 1. define db schema
/**
 * @entry blogs
 */
export interface BlogSchema {
  id: number
  content: string
  meta: unknown
}
/**
 * @entry posts
 */
export interface PostSchema {
  id: number
  content: string
  blogId: number
}

// 2. generate db declaration
`DB_SCHEMA_PATH=./db-schema OUTPUT_PATH=./dev/db-declaration.ts types-as-schema ./dev/db-schema.ts --config ./node_modules/protocol-based-web-framework/nodejs/generate-db-declaration.js`

// 3. access db sqlite
import * as sqlite from 'sqlite3'
import { SqliteAccessor } from 'protocol-based-web-framework'
import { CountRow, DeleteRow, GetRow, InsertRow, SelectRow, tableNames, tableSchemas, UpdateRow } from './db-declaration'

const sqliteAccessor = new SqliteAccessor(new sqlite.Database(':memory:'), tableSchemas)
const insertRow: InsertRow = sqliteAccessor.insertRow
const updateRow: UpdateRow = sqliteAccessor.updateRow
const getRow: GetRow = sqliteAccessor.getRow
const selectRow: SelectRow = sqliteAccessor.selectRow
const deleteRow: DeleteRow = sqliteAccessor.deleteRow
const countRow: CountRow = sqliteAccessor.countRow

for (const tableName of tableNames) {
  await sqliteAccessor.createTable(tableName)
}
await insertRow('blogs', { id: 1, content: 'blog 1 content', meta: { foo: 'bar' } })
await insertRow('posts', { id: 11, content: 'post 11 content', blogId: 1 })
await updateRow('blogs', { content: 'new content' }, { filter: { id: 1 } })
await getRow('blogs', { filter: { content: 'new content' } })
await selectRow('posts', { filter: { blogId: 1 }, pagination: { take: 10, skip: 10 }, sort: [{ field: 'id', type: 'asc' }] })
await countRow('posts', { filter: { blogId: 1 } })
await deleteRow('blogs', { filter: { id: 1 } })

// 4. define restful api schema
import { BlogSchema, PostSchema } from "./db-schema"

/**
 * @method get
 * @path /api/blogs
 * @tags blog
 */
declare function getBlogs(
  query: PaginationFields & BlogIgnoredField & SortTypeField & {
    content?: string
    /**
     * @default id
     */
    sortField?: 'id' | 'content'
    ids?: string[]
  },
  cookie: MyUserIdField,
): Promise<{ result: Blog[], count: number }>

/**
 * @method get
 * @path /api/blogs/{id}
 * @tags blog
 */
declare function getBlogById(
  query: BlogIgnoredField,
  path: IdField,
  cookie: MyUserIdField,
): Promise<{ result?: Blog }>

/**
 * @method post
 * @path /api/blogs
 * @tags blog
 */
declare function createBlog(
  query: BlogIgnoredField,
  body: {
    content: string
  },
  cookie: MyUserIdField,
): Promise<{ result: Blog }>

/**
 * @method patch
 * @path /api/blogs/{id}
 * @tags blog
 */
declare function patchBlog(
  query: BlogIgnoredField,
  path: IdField,
  body: {
    content?: string
    meta?: unknown
  },
  cookie: MyUserIdField,
): Promise<{ result: Blog }>

/**
 * @method delete
 * @path /api/blogs/{id}
 * @tags blog
 */
declare function deleteBlog(
  path: IdField,
  cookie: MyUserIdField,
): Promise<{}>

export type BlogIgnorableField = 'posts' | 'meta'

export interface Blog extends BlogSchema {
  posts: PostSchema[]
}

interface PaginationFields {
  /**
   * @default 0
   */
  skip?: number
  /**
   * @default 10
   */
  take?: number
}

interface SortTypeField {
  /**
   * @default asc
   */
  sortType?: 'asc' | 'desc'
}

interface IdField {
  id: number
}

interface BlogIgnoredField {
  ignoredFields?: BlogIgnorableField[]
}

interface MyUserIdField {
  myUserId: number
}

// 5. generate restful api declaration
`RESTFUL_API_SCHEMA_PATH=./restful-api-schema BACKEND_OUTPUT_PATH=./dev/restful-api-backend-declaration.ts FRONTEND_OUTPUT_PATH=./dev/restful-api-frontend-declaration.ts types-as-schema ./dev/restful-api-schema.ts ./dev/db-schema.ts --swagger ./dev/swagger.json --config ./node_modules/protocol-based-web-framework/nodejs/generate-restful-api-declaration.js`

// 6. backend implement restful api declaration
import { CreateBlog, DeleteBlog, GetBlogById, GetBlogs, PatchBlog } from './restful-api-backend-declaration'
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

// 7. access restful api in backend unit test
const blog = await createBlog({
  body: {
    content: 'test'
  }
})
t.snapshot(blog)

// 8. backend implement HandleHttpRequest and register restful api
import express from 'express'
import * as bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import { HandleHttpRequest, getAndValidateRequestInput, respondHandleResult } from 'protocol-based-web-framework'
import { registerCreateBlog, registerDeleteBlog, registerGetBlogById, registerGetBlogs, registerPatchBlog } from './restful-api-backend-declaration'
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
const app = express()
app.use(bodyParser.json())
app.use(cookieParser())
registerGetBlogs(app, handleHttpRequest, getBlogs)
registerGetBlogById(app, handleHttpRequest, getBlogById)
registerCreateBlog(app, handleHttpRequest, createBlog)
registerPatchBlog(app, handleHttpRequest, patchBlog)
registerDeleteBlog(app, handleHttpRequest, deleteBlog)
app.listen(3000)

// 9. access restful api
import { ApiAccessorFetch } from 'protocol-based-web-framework'
const apiAccessor = new ApiAccessorFetch(validations)
const requestRestfulAPI: RequestRestfulAPI = apiAccessor.requestRestfulAPI
await requestRestfulAPI('GET', '/api/blogs', { query: { ignoredFields: ['posts', 'meta'] } })
await requestRestfulAPI('GET', '/api/blogs/{id}', { path: { id: 1 } })
await requestRestfulAPI('POST', '/api/blogs', { body: { content: 'test' } })
await requestRestfulAPI('PATCH', '/api/blogs/1', { body: { content: 'test222' } })
await requestRestfulAPI('DELETE', '/api/blogs/2')
```
