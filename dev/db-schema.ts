/**
 * @entry blogs
 */
 export interface BlogSchema {
  id: number
  content: string
  meta: unknown
}

/**
 * @entry posts
 */
export interface PostSchema {
  id: number
  content: string
  blogId: number
}