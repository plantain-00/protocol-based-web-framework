import { MongoClient, ObjectId } from 'mongodb'
import { MongodbAccessor, MongodbRawFilter } from '@protocol-based-web-framework/db'
import { CountRow, DeleteRow, GetRow, InsertRow, SelectRow, tableSchemas, UpdateRow } from '../generated/db-declaration'
import { seed } from './seed'

const client = new MongoClient('mongodb://localhost:27017')
await client.connect()
const mongodbAccessor = new MongodbAccessor(client.db('test'), tableSchemas)
export const insertRow: InsertRow<ObjectId> = mongodbAccessor.insertRow
export const updateRow: UpdateRow<MongodbRawFilter> = mongodbAccessor.updateRow
export const getRow: GetRow<MongodbRawFilter> = mongodbAccessor.getRow
export const selectRow: SelectRow<MongodbRawFilter> = mongodbAccessor.selectRow
export const deleteRow: DeleteRow<MongodbRawFilter> = mongodbAccessor.deleteRow
export const countRow: CountRow<MongodbRawFilter> = mongodbAccessor.countRow

await seed(insertRow)
