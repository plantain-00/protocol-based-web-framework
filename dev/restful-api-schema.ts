import { BlogSchema, PostSchema } from "./db-schema"

/**
 * @method get
 * @path /api/blogs
 * @tags blog
 */
declare function getBlogs(
  /**
   * @in query
   * @default 0
   */
  skip?: number,
  /**
   * @in query
   * @default 10
   */
  take?: number,
  /**
   * @in query
   */
  content?: string,
  /**
   * @in query
   * @default id
   */
  sortField?: 'id' | 'content',
  /**
   * @in query
   * @default asc
   */
  sortType?: 'asc' | 'desc',
  /**
   * @in query
   */
  ignoredFields?: BlogIgnorableField[],
  /**
   * @in query
   */
  ids?: string[],
): Promise<{ result: Blog[], count: number }>

/**
 * @method get
 * @path /api/blogs/{id}
 * @tags blog
 */
declare function getBlogById(
  /**
   * @in path
   */
  id: number,
  /**
   * @in query
   */
  ignoredFields?: BlogIgnorableField[],
): Promise<{ result?: Blog }>

/**
 * @method post
 * @path /api/blogs
 * @tags blog
 */
declare function createBlog(
  /**
   * @in body
   */
  content: string,
  /**
   * @in query
   */
  ignoredFields?: BlogIgnorableField[],
): Promise<{ result: Blog }>

/**
 * @method patch
 * @path /api/blogs/{id}
 * @tags blog
 */
declare function patchBlog(
  /**
   * @in path
   */
  id: number,
  /**
   * @in body
   */
  content?: string,
  /**
   * @in body
   */
  meta?: unknown,
  /**
   * @in query
   */
  ignoredFields?: BlogIgnorableField[],
): Promise<{ result: Blog }>

/**
 * @method delete
 * @path /api/blogs/{id}
 * @tags blog
 */
declare function deleteBlog(
  /**
   * @in path
   */
  id: number,
): Promise<{}>

export type BlogIgnorableField = 'posts' | 'meta'

export interface Blog extends BlogSchema {
  posts: PostSchema[]
}
