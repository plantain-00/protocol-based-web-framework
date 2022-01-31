import sqlite from 'sqlite3'
import { SqliteAccessor } from '@protocol-based-web-framework/db'
import { CountRow, DeleteRow, GetRow, InsertRow, SelectRow, tableNames, tableSchemas, UpdateRow } from '../generated/db-declaration.js'
import { seed } from './seed.js'

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

await seed(insertRow)
