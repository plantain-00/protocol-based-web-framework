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

`@entry` is the table name.

Different db schemas can share same fields, for example:

```ts
interface BlogSchema extends Created, Updated {
  // ...
}
interface PostSchema extends Created, Updated {
  // ...
}
interface Created {
  createdBy: number
  createdAt: string
}
interface Updated {
  updatedBy: number
  updatedAt: string
}
```

+ Field name is the db table field name.
+ Non-optional field means the db table field is `NOT NULL`
+ Field type is the db table field type, for postgres, `number` means `real`, `string` means `text`, `boolean` means `boolean`, `Date` means `timestamp with time zone`, other types will stored as `jsonb`. `@type` can be used to mark more explicited db field type, for example `@type integer`.
+ `@autoincrement` marked field means the db table field is `INTEGER PRIMARY KEY`(sqlite) or `SERIAL`(postgress)
+ `@unique` marked field means the db table field is `UNIQUE`
+ `@index` marked field means the db table field is `INDEX`

[dev/db-schema.ts](./dev/db-schema.ts)

### 2. generate db declaration

`DB_SCHEMA_PATH=./db-schema OUTPUT_PATH=./dev/db-declaration.ts types-as-schema ./dev/db-schema.ts --config ./node_modules/protocol-based-web-framework/db.ts`

`OUTPUT_PATH` is output file path.

`DB_SCHEMA_PATH` is db schema model entry file path(relative to output file), generated ts file will import types from it.

`--config` is the generation script file path.

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

`createTable` can also migrate compatible db schema changes by `CREATE TABLE IF NOT EXISTS` and `ADD COLUMN IF NOT EXISTS`.

`getRow` and `selectRow` support ignorable/pickable.

+ It's type safe, if the fields are ignored or not picked, the return value's type will omit them.
+ Only not ignored and picked fields will be in executed sql or mongodb projection.

```ts
const blogs = await selectRow('blogs', {
  pickedFields: ['id'],
})
```

The accessor supports `filter`, `fuzzyFilter` and `rawFilter`, for example:

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

`@method`, `@path`, `@tags` follow swagger specification.

Function name should be unique name for api binding, and is used for generating backend types: `getBlogs` -> `GetBlogs`

Function parameter name can be `query`, `path`, `body`, `cookie`, they are different parts of a restful api request.

Function parameter type defines parameters(`name`, `required`, `schema`) of each restful api request part.

Default value in function parameter is used to fill default value when the parameter is not passed, for example, an api request is `curl -v http://localhost:3000/api/blogs`, then in api handler, the `req` is `{ query: { skip: 0, take: 10 }}`

`query` parts can have `ignoredFields` or `pickedFields`
parameters, with these, it will support ignorable/pickable, for example:

```ts
declare function getBlogs(
  query: PaginationFields & BlogFieldFilter,
): Promise<{ result: BlogSchema[], count: number }>

interface BlogFieldFilter {
  ignoredFields?: (keyof BlogSchema)[]
  pickedFields?: (keyof BlogSchema)[]
}
```

### 5. generate restful api declaration

`RESTFUL_API_SCHEMA_PATH=./restful-api-schema BACKEND_OUTPUT_PATH=./dev/restful-api-backend-declaration.ts FRONTEND_OUTPUT_PATH=./dev/restful-api-frontend-declaration.ts types-as-schema ./dev/restful-api-schema.ts ./dev/db-schema.ts --swagger ./dev/swagger.json --config ./node_modules/protocol-based-web-framework/restful-api.ts`

`BACKEND_OUTPUT_PATH` and `FRONTEND_OUTPUT_PATH` are backend and frontend output file path.

`RESTFUL_API_SCHEMA_PATH` is restful api schema model entry file path(relative to output file), generated ts file will import types from it.

`--swagger` and `--swagger-base`(optional) are used to generate swagger json file. for example, [dev/swagger.json](./dev/swagger.json).

`--config` is the generation script file path.

`IGNORED_FIELDS_NAME` and `PICKED_FIELDS_NAME` are custom ignored/picked fields parameter name if they are not `ignoredFields` and `pickedFields`.

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

If `getBlogs` supports ignorable/pickable, it's type safe, if the fields are ignored or not picked, the return value's type will omit them.

```ts
const blogs = await getBlogs({
  query: {
    skip: 0,
    take: 10,
    pickedFields: ['id'],
  },
})
```

The `getBlogs` can also be used in unit test, so it can be tested faster than by e2e test.

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

### 7. backend register restful api

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

`getAndValidateRequestInput` can validate the request, for example:

```txt
curl -v http://localhost:3000/api/blogs/abc

HTTP/1.1 400 Bad Request
{"message":"must be number"}
```

`getAndValidateRequestInput` will remove unexpected input in request, for example, a api request is `curl -v http://localhost:3000/api/blogs?test=abc`, then in api handler, the `req` is `{ query: { skip: 0, take: 10 }}`, the `test=abc` will be ignored if not defined in api schema.

`getAndValidateRequestInput` will do request input type convertion, for example, a api request is `curl -v http://localhost:3000/api/blogs?take=100`, then in api handler, the `req` is `{ query: { skip: 0, take: 100 }}` rather than `{ query: { skip: 0, take: "100" }}`.

### 8. access restful api

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
+ node-fetch: [dev/client-node-fetch.ts](./dev/client-node-fetch.ts)

`requestRestfulAPI` is type safe, for example:

```ts
await requestRestfulAPI('GET', `/api/blogs/1`) // ✅
await requestRestfulAPI('GET', `/api/blogs/abc`) // ❌
await requestRestfulAPI('GET', '/api/blogs/{id}', { path: { id: 1 } }) // ✅
await requestRestfulAPI('GET', '/api/blogs/{id}', { path: { id: 'abc' } }) // ❌
```

`requestRestfulAPI` will validate api response, so client side can believe the `blogs` can always be `{ result: BlogSchema[], count: number }`.

If the api supports ignorable/pickable, it's type safe, if the fields are ignored or not picked, the return value's type will omit them.

```ts
const blogs = await requestRestfulAPI('GET', '/api/blogs', { query: { skip: 0, take: 10, pickedFields: ['id'] } })
```
