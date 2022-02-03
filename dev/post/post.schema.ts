/**
 * @entry posts
 */
export interface PostSchema {
  id: number
  content: string
  blogId: number
}

/**
 * @localStorage post-key
 */
type post = PostSchema
