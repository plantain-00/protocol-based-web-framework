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

[dev/swagger.json](./dev/swagger.json)

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
await requestRestfulAPI('GET', `/api/blogs/1`) // ✅
await requestRestfulAPI('GET', `/api/blogs/abc`) // ❌
await requestRestfulAPI('GET', '/api/blogs/{id}', { path: { id: 1 } }) // ✅
await requestRestfulAPI('GET', '/api/blogs/{id}', { path: { id: 'abc' } }) // ❌
```

### optional query population

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

### 1. define db schema

```ts
/**
 * @entry blogs
 */
export interface BlogSchema {
  /**
   * @autoincrement
   */
  id: number
  title: string
  content: string
}
```

[dev/db-schema.ts](./dev/db-schema.ts)

### 2. generate db declaration

`DB_SCHEMA_PATH=./db-schema OUTPUT_PATH=./dev/db-declaration.ts types-as-schema ./dev/db-schema.ts --config ./node_modules/protocol-based-web-framework/nodejs/generate-db-declaration.js`

### 3. access db

```ts
import * as sqlite from 'sqlite3'
import { SqliteAccessor } from 'protocol-based-web-framework'
import { CountRow, DeleteRow, GetRow, InsertRow, SelectRow, tableNames, tableSchemas, UpdateRow } from './db-declaration'

const sqliteAccessor = new SqliteAccessor(new sqlite.Database(':memory:'), tableSchemas)
export const insertRow: InsertRow = sqliteAccessor.insertRow
export const updateRow: UpdateRow = sqliteAccessor.updateRow
export const getRow: GetRow = sqliteAccessor.getRow
export const selectRow: SelectRow = sqliteAccessor.selectRow
export const deleteRow: DeleteRow = sqliteAccessor.deleteRow
export const countRow: CountRow = sqliteAccessor.countRow

for (const tableName of tableNames) {
  await sqliteAccessor.createTable(tableName)
}

const id = await insertRow('blogs', { title: 'a', content: 'content a' })
await updateRow('blogs', { content: 'new content' }, { filter: { id } })
const rows = await selectRow('blogs')
console.info(rows)
await deleteRow('blogs', { filter: { id } })
```

+ sqlite: [dev/sqlite-service.ts](./dev/sqlite-service.ts)
+ mongodb: [dev/mongodb-service.ts](./dev/mongodb-service.ts)
+ postgres: [dev/postgres-service.ts](./dev/postgres-service.ts)

### 4. define restful api schema

```ts
/**
 * @method get
 * @path /api/blogs
 * @tags blog
 */
declare function getBlogs(
  query: PaginationFields,
): Promise<{ result: BlogSchema[], count: number }>

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
```

[dev/restful-api-schema.ts](./dev/restful-api-schema.ts)

### 5. generate restful api declaration

`RESTFUL_API_SCHEMA_PATH=./restful-api-schema BACKEND_OUTPUT_PATH=./dev/restful-api-backend-declaration.ts FRONTEND_OUTPUT_PATH=./dev/restful-api-frontend-declaration.ts types-as-schema ./dev/restful-api-schema.ts ./dev/db-schema.ts --swagger ./dev/swagger.json --config ./node_modules/protocol-based-web-framework/nodejs/generate-restful-api-declaration.js`

### 6. backend implement restful api declaration and binded to api

```ts
import { bindRestfulApiHandler, GetBlogs } from './restful-api-backend-declaration'

export const getBlogs: GetBlogs = async ({ query: { skip, take } }) => {
  return {
    result: await selectRow('blogs', {
      pagination: {
        take,
        skip,
      },
    }),
    count: await countRow('blogs'),
  }
}
bindRestfulApiHandler('GetBlogs', getBlogs)
```

[dev/blog-service.ts](./dev/blog-service.ts)

### 7. access restful api in backend unit test

```ts
const blog = await getBlogs({
  query: {
    skip: 0,
    take: 10,
  },
})
t.snapshot(blog)
```

[spec/blog-service.ts](./spec/blog-service.ts)

### 8. backend register restful api

```ts
import express from 'express'
import * as bodyParser from 'body-parser'
import { getAndValidateRequestInput, respondHandleResult } from 'protocol-based-web-framework'
import { apiSchemas } from './restful-api-backend-declaration'

const app = express()
app.use(bodyParser.json())

for (const { method, url, validate, handler } of apiSchemas) {
  app[method](url, async (req: express.Request, res: express.Response) => {
    try {
      if (!handler) {
        throw new Error('this api handler is not binded')
      }
      const input = getAndValidateRequestInput(req, validate)
      if (typeof input === 'string') {
        throw new Error(input)
      }
      const result = await handler(input)
      respondHandleResult(result, req, res)
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : error }).end()
    }
  })
}
app.listen(3000)
```

[dev/server.ts](./dev/server.ts)

### 9. access restful api

```ts
import { RequestRestfulAPI, validations } from "./restful-api-frontend-declaration"
import { ApiAccessorFetch } from 'protocol-based-web-framework'

const apiAccessor = new ApiAccessorFetch(validations)
const requestRestfulAPI: RequestRestfulAPI = apiAccessor.requestRestfulAPI

const blogs = await requestRestfulAPI('GET', '/api/blogs', { query: { skip: 0, take: 10 } })
console.info(blogs)
```

+ fetch: [dev/client-fetch.ts](./dev/client-fetch.ts)
+ axios: [dev/client-axios.ts](./dev/client-axios.ts)
