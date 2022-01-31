import { Client } from 'pg'
import { PostgresAccessor } from '@protocol-based-web-framework/db'
import { CountRow, DeleteRow, GetRow, InsertRow, SelectRow, tableNames, tableSchemas, UpdateRow } from '../generated/db-declaration.js'
import { seed } from './seed.js'

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

await seed(insertRow)
