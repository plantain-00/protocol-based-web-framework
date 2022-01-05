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

### type safe ignorable/pickable field in db access

```ts
const blogs1 = await selectRow('blogs', {
  ignoredFields: ['content', 'meta'],
})
// sql: SELECT id FROM blogs
// blogs1: Omit<Pick<BlogSchema, keyof BlogSchema>, "content" | "meta">[]
// blogs1: [ { id: 2 } ]

const blogs2 = await selectRow('blogs', {
  pickedFields: ['id', 'content'],
})
// sql: SELECT id, content FROM blogs
// blogs2: Omit<Pick<BlogSchema, "id" | "content">, never>[]
// blogs2: [ { id: 2, content: 'blog 2 content' } ]
```

### type safe ignorable/pickable field in restful api backend access

```ts
const blogs1 = await getBlogs({
  query: {
    skip: 0,
    take: 10,
    sortField: 'id',
    sortType: 'asc',
    ignoredFields: ['posts', 'meta'],
  },
  cookie: {
    myUserId: 1,
  },
})
// blogs1: { result: Omit<Pick<Blog, "posts" | "id" | "content" | "meta">, "posts" | "meta">[]; count: number; }
// blogs1: { result: [ { id: 2, content: 'blog 2 content' } ], count: 1 }

const blogs2 = await getBlogs({
  query: {
    skip: 0,
    take: 10,
    sortField: 'id',
    sortType: 'asc',
    pickedFields: ['id', 'posts'],
  },
  cookie: {
    myUserId: 1,
  },
})
// blogs2: { result: Omit<Pick<Blog, "posts" | "id">, never>[]; count: number; }
// blogs2: { result: [ { id: 2, posts: [Array] } ], count: 1 }
```

### type safe ignorable/pickable field in restful api frontend side access

```ts
const blogs1 = await requestRestfulAPI('GET', '/api/blogs', { query: { ignoredFields: ['posts', 'meta'] } })
// blogs1: { result: Omit<Pick<Blog, "posts" | "id" | "content" | "meta">, "posts" | "meta">[]; count: number; }
// blogs1: { result: [ { id: 2, content: 'blog 2 content' } ], count: 1 }

const blogs2 = await requestRestfulAPI('GET', '/api/blogs', { query: { pickedFields: ['id', 'content'] } })
// blogs2: { result: Omit<Pick<Blog, "id" | "content">, never>[]; count: number; }
// blogs2: { result: [ { id: 2, content: 'blog 2 content' } ], count: 1 }
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
    posts: !isIncluded('posts') ? undefined : await selectRow('posts', { filter: { blogId: blog.id } }), // ignored or populated
    meta: !isIncluded('meta') ? undefined : blog.meta,
  } as Omit<Pick<Blog, TPicked>, TIgnored>
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
  query: PaginationFields & BlogFieldFilter & SortTypeField & {
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
  query: BlogFieldFilter,
  path: IdField,
  cookie: MyUserIdField,
): Promise<{ result?: Blog }>

/**
 * @method post
 * @path /api/blogs
 * @tags blog
 */
declare function createBlog(
  query: BlogFieldFilter,
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
  query: BlogFieldFilter,
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

interface BlogFieldFilter {
  ignoredFields?: BlogIgnorableField[]
  pickedFields?: (keyof Blog)[]
}

interface MyUserIdField {
  myUserId: number
}

// 5. generate restful api declaration
`RESTFUL_API_SCHEMA_PATH=./restful-api-schema BACKEND_OUTPUT_PATH=./dev/restful-api-backend-declaration.ts FRONTEND_OUTPUT_PATH=./dev/restful-api-frontend-declaration.ts types-as-schema ./dev/restful-api-schema.ts ./dev/db-schema.ts --swagger ./dev/swagger.json --config ./node_modules/protocol-based-web-framework/nodejs/generate-restful-api-declaration.js`

// 6. backend implement restful api declaration and binded to api
import { RowFilterOptions } from 'protocol-based-web-framework'
import { tableSchemas } from './db-declaration'
import { bindRestfulApiHandler, CreateBlog, DeleteBlog, GetBlogById, GetBlogs, PatchBlog } from './restful-api-backend-declaration'

const getBlogs: GetBlogs = async ({ query: { sortField, sortType, content, skip, take, ignoredFields, pickedFields } }) => {
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
const getBlogById: GetBlogById = async ({ query, path: { id } }) => {
  const blog = await getRow('blogs', { filter: { id }, ...extractBlogDbFilteredFields(query) })
  return {
    result: blog ? await getBlogFilteredFields(blog, query) : undefined
  }
}
bindRestfulApiHandler('GetBlogById', getBlogById)
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
    result: await getBlogFilteredFields(blog, query)
  }
}
bindRestfulApiHandler('CreateBlog', createBlog)
const patchBlog: PatchBlog = async ({ path: { id }, query, body }) => {
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
const deleteBlog: DeleteBlog = async ({ path: { id } }) => {
  await deleteRow('blogs', { filter: { id } })
  return {}
}
bindRestfulApiHandler('DeleteBlog', deleteBlog)

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
class HttpError extends Error {
  constructor(message: string, public statusCode = 500) {
    super(message)
  }
}

// 7. access restful api in backend unit test
const blog = await createBlog({
  body: {
    content: 'test'
  }
})
t.snapshot(blog)

// 8. backend register restful api
import express from 'express'
import * as bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import { getAndValidateRequestInput, respondHandleResult } from 'protocol-based-web-framework'
import { apiSchemas } from './restful-api-backend-declaration'

const app = express()
app.use(bodyParser.json())
app.use(cookieParser())
for (const { method, url, validate, handler } of apiSchemas) {
  app[method](url, async (req: express.Request<{}, {}, {}>, res: express.Response<{}>) => {
    try {
      if (!handler) {
        throw new HttpError('this api handler is not binded', 500)
      }
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
app.listen(3000)

// 9. access restful api
import { ApiAccessorFetch } from 'protocol-based-web-framework'
import { RequestRestfulAPI, validations } from "./restful-api-frontend-declaration"
const apiAccessor = new ApiAccessorFetch(validations)
const requestRestfulAPI: RequestRestfulAPI = apiAccessor.requestRestfulAPI
await requestRestfulAPI('GET', '/api/blogs', { query: { ignoredFields: ['posts', 'meta'] } })
await requestRestfulAPI('GET', '/api/blogs/{id}', { path: { id: 1 } })
await requestRestfulAPI('POST', '/api/blogs', { body: { content: 'test' } })
await requestRestfulAPI('PATCH', '/api/blogs/1', { body: { content: 'test222' } })
await requestRestfulAPI('DELETE', '/api/blogs/2')
```
