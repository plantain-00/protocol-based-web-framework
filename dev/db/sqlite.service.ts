import * as sqlite from 'sqlite3'
import { SqliteAccessor } from '../../dist/nodejs'
import { CountRow, DeleteRow, GetRow, InsertRow, SelectRow, tableNames, tableSchemas, UpdateRow } from '../db-declaration'

const sqliteAccessor = new SqliteAccessor(new sqlite.Database(':memory:'), tableSchemas)
export const insertRow: InsertRow = sqliteAccessor.insertRow
export const updateRow: UpdateRow = sqliteAccessor.updateRow
export const getRow: GetRow = sqliteAccessor.getRow
export const selectRow: SelectRow = sqliteAccessor.selectRow
export const deleteRow: DeleteRow = sqliteAccessor.deleteRow
export const countRow: CountRow = sqliteAccessor.countRow

export async function initializeDatabase() {
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
}
