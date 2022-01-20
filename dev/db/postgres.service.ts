import { Client } from 'pg'
import { PostgresAccessor } from '../../dist/nodejs/index.js'
import { CountRow, DeleteRow, GetRow, InsertRow, SelectRow, tableNames, tableSchemas, UpdateRow } from '../generated/db-declaration.js'

const client = new Client()
await client.connect()
const postgresAccessor = new PostgresAccessor(client, tableSchemas)
export const insertRow: InsertRow = postgresAccessor.insertRow
export const updateRow: UpdateRow = postgresAccessor.updateRow
export const getRow: GetRow = postgresAccessor.getRow
export const selectRow: SelectRow = postgresAccessor.selectRow
export const deleteRow: DeleteRow = postgresAccessor.deleteRow
export const countRow: CountRow = postgresAccessor.countRow

for (const tableName of tableNames) {
  await postgresAccessor.createTable(tableName)
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
