import { MongoClient, ObjectId } from 'mongodb'
import { MongodbAccessor, MongodbRawFilter } from '../../dist/nodejs'
import { CountRow, DeleteRow, GetRow, InsertRow, SelectRow, tableSchemas, UpdateRow } from '../generated/db-declaration'

const client = new MongoClient('mongodb://localhost:27017')
await client.connect()
const mongodbAccessor = new MongodbAccessor(client.db('test'), tableSchemas)
export const insertRow: InsertRow<ObjectId> = mongodbAccessor.insertRow
export const updateRow: UpdateRow<MongodbRawFilter> = mongodbAccessor.updateRow
export const getRow: GetRow<MongodbRawFilter> = mongodbAccessor.getRow
export const selectRow: SelectRow<MongodbRawFilter> = mongodbAccessor.selectRow
export const deleteRow: DeleteRow<MongodbRawFilter> = mongodbAccessor.deleteRow
export const countRow: CountRow<MongodbRawFilter> = mongodbAccessor.countRow

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
