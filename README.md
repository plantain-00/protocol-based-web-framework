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

`yarn add protocol-based-web-framework @protocol-based-web-framework/restful-api-consumer @protocol-based-web-framework/router -D`

`yarn add @protocol-based-web-framework/db @protocol-based-web-framework/restful-api-provider -S`

## usage

### 2. project structure

```txt
src
├─ api
│  ├─ axios.service.ts
│  ├─ fetch.service.ts
│  └─ node-fetch.service.ts
├─ blog
│  ├─ blog.page.tsx
│  ├─ blog.page.story.tsx
│  ├─ blog.schema.ts
│  ├─ blog.controller.test.ts
│  └─ blog.controller.ts
├─ db
│  ├─ mongodb.service.ts
│  ├─ postgres.service.ts
│  ├─ sqlite.service.test.ts
│  └─ sqlite.service.ts
├─ generated
│  ├─ db-declaration.ts
│  ├─ import-controllers.ts
│  ├─ import-pages.ts
│  ├─ import-stories.ts
│  ├─ restful-api-backend-declaration.ts
│  ├─ restful-api-frontend-declaration.ts
│  ├─ router-declaration.ts
│  └─ swagger.json
├─ home
│  ├─ home.page.tsx
│  └─ home.schema.ts
├─ post
│  └─ post.schema.ts
├─ react-app.tsx
├─ server.ts
├─ shared
│  ├─ contexts.ts
│  ├─ http-error.ts
│  ├─ page-url.ts
│  └─ shared.schema.ts
├─ story-app.tsx
└─ webpack.config.js
```

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

[dev/blog/blog.schema.ts](./dev/blog/blog.schema.ts)

### 2. generate db declaration

`types-as-schema -p ./types-as-schema.config.ts`

```ts
import { Configuration } from 'types-as-schema'
import { generateDbDeclaration } from 'protocol-based-web-framework'

const config: Configuration = {
  files: [
    './dev/**/*.schema.ts',
  ],
  plugins: [
    (typeDeclarations) => generateDbDeclaration(typeDeclarations, './dev/generated/db-declaration.ts'),
  ],
}

export default config
```

### 3. access db

```ts
import * as sqlite from 'sqlite3'
import { SqliteAccessor } from '@protocol-based-web-framework/db'
import { CountRow, DeleteRow, GetRow, InsertRow, SelectRow, tableNames, tableSchemas, UpdateRow } from './generated/db-declaration'

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
```

+ sqlite: [dev/db/sqlite.service.ts](./dev/db/sqlite.service.ts)
+ mongodb: [dev/db/mongodb.service.ts](./dev/db/mongodb.service.ts)
+ postgres: [dev/db/postgres.service.ts](./dev/db/postgres.service.ts)

Db service can be used like:

```ts
const id = await insertRow('blogs', { title: 'a', content: 'content a' })
await updateRow('blogs', { content: 'new content' }, { filter: { id } })
const rows = await selectRow('blogs')
console.info(rows)
await deleteRow('blogs', { filter: { id } })
```

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
type getBlogs = (
  query: PaginationFields,
) => { result: BlogSchema[], count: number }

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

[dev/blog/blog.schema.ts](./dev/blog/blog.schema.ts)

`@method`, `@path`, `@tags` follow swagger specification.

Function name should be unique name for api binding, and is used for generating backend types: `getBlogs` -> `GetBlogs`

Function parameter name can be `query`, `path`, `body`, `cookie`, they are different parts of a restful api request.

Function parameter type defines parameters(`name`, `required`, `schema`) of each restful api request part.

Default value in function parameter is used to fill default value when the parameter is not passed, for example, an api request is `curl -v http://localhost:3000/api/blogs`, then in api handler, the `req` is `{ query: { skip: 0, take: 10 }}`

`query` parts can have `ignoredFields` or `pickedFields`
parameters, with these, it will support ignorable/pickable, for example:

```ts
type getBlogs = (
  query: PaginationFields & BlogFieldFilter,
) => { result: BlogSchema[], count: number }

interface BlogFieldFilter {
  ignoredFields?: (keyof BlogSchema)[]
  pickedFields?: (keyof BlogSchema)[]
}
```

### 5. generate restful api declaration

`types-as-schema -p ./types-as-schema.config.ts`

```ts
import { Configuration } from 'types-as-schema'
import { generateRestfulApiDeclaration } from 'protocol-based-web-framework'

const config: Configuration = {
  files: [
    './dev/**/*.schema.ts',
  ],
  swagger: {
    outputPath: './dev/generated/swagger.json',
    base: {
      info: {}
    },
  },
  plugins: [
    (typeDeclarations) => generateRestfulApiDeclaration(typeDeclarations, './dev/generated/restful-api-backend-declaration.ts', './dev/generated/restful-api-frontend-declaration.ts'),
  ],
}

export default config
```

### 6. backend implement restful api declaration and binded to api

```ts
import { bindRestfulApiHandler, GetBlogs } from './generated/restful-api-backend-declaration'

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

[dev/blog/blog.controller.ts](./dev/blog/blog.controller.ts)

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

[dev/blog/blog.controller.test.ts](./dev/blog/blog.controller.test.ts)

### 7. backend register restful api

```ts
import express from 'express'
import * as bodyParser from 'body-parser'
import { getAndValidateRequestInput, respondHandleResult } from '@protocol-based-web-framework/restful-api-provider'
import { apiSchemas } from './generated/restful-api-backend-declaration'

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
import { RequestRestfulAPI, validations } from "./generated/restful-api-frontend-declaration"
import { ApiAccessorFetch } from '@protocol-based-web-framework/restful-api-consumer'

export const apiAccessor = new ApiAccessorFetch(validations)
export const requestRestfulAPI: RequestRestfulAPI = apiAccessor.requestRestfulAPI
```

+ fetch: [dev/api/fetch.service.ts](./dev/api/fetch.service.ts)
+ axios: [dev/api/axios.service.ts](./dev/api/axios.service.ts)
+ node-fetch: [dev/api/node-fetch.service.ts](./dev/api/node-fetch.service.ts)

It can be used like:

```ts
const blogs = await requestRestfulAPI('GET', '/api/blogs', { query: { skip: 0, take: 10 } })
console.info(blogs)
```

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

### 9. define router schema

```ts
/**
 * @route /blogs
 */
export interface BlogsPageProps {
  query: {
    /**
     * @default 1
     */
    page: number
  },
}


/**
 * @route /blogs/{id}
 */
export interface BlogPageProps {
  path: {
    id: number
  }
}
```

[dev/blog/blog.schema.ts](./dev/blog/blog.schema.ts)

`@route` follows swagger `path` specification.

type name should be unique name, and is used for page component props types.

type field name can be `query` and `path`, they are different parts of a url.

Default value in type field is used to fill default value when the parameter is not passed, for example, a page url is `http://localhost:4000/blogs`, then in page component, the `props` is `{ query: { page: 1 }}`

### 10. generate router declaration

`types-as-schema -p ./types-as-schema.config.ts`

```ts
import { Configuration } from 'types-as-schema'
import { generateRouterDeclaration } from 'protocol-based-web-framework'

const config: Configuration = {
  files: [
    './dev/**/*.schema.ts',
  ],
  plugins: [
    (typeDeclarations) => generateRouterDeclaration(typeDeclarations, './dev/generated/router-declaration.ts'),
  ],
}

export default config
```

### 11. bind component to the route

```ts
import { bindRouterComponent } from './generated/router-declaration'

function BlogPage(props: BlogPageProps) {
  React.useEffect(() => {
    requestRestfulAPI('GET', `/api/blogs/${props.path.id}`).then((b) => {
      console.info(b.result)
    })
  }, [])
  return <></>
}
bindRouterComponent('/blogs/:id', BlogPage)
```

[dev/blog/blog.page.tsx](./dev/blog/blog.page.tsx)

The `BlogPage` can be used in storybook, so it can be easy to build components in isolation, outside of whole app.

```ts
import { BlogPage } from "./blog.page"

export default () => {
  return (
    <BlogPage path={{ id: 123 }} />
  )
}
```

[dev/blog/blog.page.story.tsx](./dev/blog/blog.page.story.tsx)

The `BlogPage` can also be used in unit test, so it can be tested without providing router in test.

```ts
expect(renderer.create(<BlogPage path={{ id: 123 }}>).toJSON()).toMatchSnapshot()
```

### 12. register router

```tsx
import React from "react"
import { matchRoute, useLocation } from '@protocol-based-web-framework/router'
import { routes } from './generated/router-declaration'

function App() {
  const [location] = useLocation(React)

  for (const route of routes) {
    if (route.Component) {
      const result = matchRoute(location, route)
      if (result !== false) {
        if (typeof result === 'string') {
          return <>{result}</>
        }
        return <route.Component {...result} />
      }
    }
  }
  return null
}
```

[dev/react-app.tsx](./dev/react-app.tsx)

`matchRoute` can validate the url, for example, a page url is `http://localhost:4000/blogs/abc`, it will return `"must be number"`.

`matchRoute` will remove unexpected input in page url, for example, a page url is `http://localhost:4000/blogs/123?test=abc`, then in page component, the `props` is `{ path: { id: 123 }}`, the `test=abc` will be ignored if not defined in router schema.

`matchRoute` will do props type convertion, for example, a page url is `http://localhost:4000/blogs/123`, then in page component, the `props` is `{ path: { id: 123 }}` rather than `{ path: { id: "123" }}`.

### 13. navigate to page url

```tsx
import { composeUrl } from '@protocol-based-web-framework/restful-api-consumer'
import { navigateTo } from '@protocol-based-web-framework/router'
import { GetPageUrl } from './generated/router-declaration'

const getPageUrl: GetPageUrl = composeUrl

navigateTo(getPageUrl('/blogs/{id}', { path: { id: blog.id } }))
navigateTo(getPageUrl(`/blogs/${blog.id}`))
```

[dev/blog/blog.page.tsx](./dev/blog/blog.page.tsx)

`getPageUrl` is type safe, for example:

```ts
getPageUrl(`/blogs/1`) // ✅
getPageUrl(`/blogs/abc`) // ❌
getPageUrl('/blogs/{id}', { path: { id: 1 } }) // ✅
getPageUrl('/blogs/{id}', { path: { id: 'abc' } }) // ❌
```

### 14. local storage

`yarn add @protocol-based-web-framework/browser-storage -D`

```ts
/**
 * @localStorage
 */
export interface Blog {
  // ...
}

/**
 * @localStorage post-key
 */
export interface PostSchema {
  // ...
}
```

```ts
import { Configuration } from 'types-as-schema'
import { generateBrowserStorageDeclaration } from 'protocol-based-web-framework'

const config: Configuration = {
  files: [
    './dev/**/*.schema.ts',
  ],
  plugins: [
    (typeDeclarations) => generateBrowserStorageDeclaration(typeDeclarations, './dev/generated/local-storage-declaration.ts', 'localStorage'),
  ],
}

export default config
```

```ts
import { StorageAccessor } from '@protocol-based-web-framework/browser-storage'
import { GetItem, RemoveItem, SetItem, validations } from '../generated/local-storage-declaration'

const storageAccessor = new StorageAccessor(localStorage, validations)
export const getItem: GetItem = storageAccessor.getItem
export const setItem: SetItem = storageAccessor.setItem
export const removeItem: RemoveItem = storageAccessor.removeItem

setItem('post-key', {
  id: 1,
  blogId: 2,
  content: '',
})
console.info(getItem('post-key'))
```
