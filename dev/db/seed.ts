import { InsertRow } from "../generated/db-declaration.js"

export async function seed<T>(insertRow: InsertRow<T>) {
  await insertRow('blogs', { id: 1, content: 'blog 1 content', meta: { foo: 'bar' } })
  await insertRow('blogs', { id: 2, content: 'blog 2 content', meta: { bar: 123 } })

  await insertRow('posts', { id: 11, content: 'post 11 content', blogId: 1 })
  await insertRow('posts', { id: 12, content: 'post 12 content', blogId: 1 })
  await insertRow('posts', { id: 13, content: 'post 13 content', blogId: 1 })
  await insertRow('posts', { id: 21, content: 'post 21 content', blogId: 2 })
  await insertRow('posts', { id: 22, content: 'post 22 content', blogId: 2 })
  await insertRow('posts', { id: 23, content: 'post 23 content', blogId: 2 })
}
