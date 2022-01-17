import test from 'ava'
import { initializeDatabase, selectRow } from '../dev/db/sqlite.service'

test('select rows', async (t) => {
  await initializeDatabase()

  const blog = await selectRow('blogs', {
  })
  t.snapshot(blog)

  const blog2 = await selectRow('blogs', {
    ignoredFields: ['meta'],
  })
  t.snapshot(blog2)

  const blog3 = await selectRow('blogs', {
    ignoredFields: ['content'],
  })
  t.snapshot(blog3)

  const blog4 = await selectRow('blogs', {
    ignoredFields: ['content', 'meta'],
  })
  t.snapshot(blog4)
})
