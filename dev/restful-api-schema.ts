import { BlogSchema, PostSchema } from "./db-schema"

/**
 * @method get
 * @path /api/blogs
 * @tags blog
 */
declare function getBlogs(
  query: PaginationFields & BlogIgnoredField & SortTypeField & {
    content?: string,
    /**
     * @default id
     */
    sortField?: 'id' | 'content',
    ids?: string[],
  },
): Promise<{ result: Blog[], count: number }>

/**
 * @method get
 * @path /api/blogs/{id}
 * @tags blog
 */
declare function getBlogById(
  query: BlogIgnoredField,
  path: IdField,
): Promise<{ result?: Blog }>

/**
 * @method post
 * @path /api/blogs
 * @tags blog
 */
declare function createBlog(
  query: BlogIgnoredField,
  body: {
    content: string,
  },
): Promise<{ result: Blog }>

/**
 * @method patch
 * @path /api/blogs/{id}
 * @tags blog
 */
declare function patchBlog(
  query: BlogIgnoredField,
  path: IdField,
  body: {
    content?: string,
    meta?: unknown,
  },
): Promise<{ result: Blog }>

/**
 * @method delete
 * @path /api/blogs/{id}
 * @tags blog
 */
declare function deleteBlog(
  path: IdField,
): Promise<{}>

export type BlogIgnorableField = 'posts' | 'meta'

export interface Blog extends BlogSchema {
  posts: PostSchema[]
}

interface PaginationFields {
  /**
   * @default 0
   */
  skip?: number,
  /**
   * @default 10
   */
  take?: number,
}

interface SortTypeField {
  /**
   * @default asc
   */
  sortType?: 'asc' | 'desc',
}

interface IdField {
  id: number,
}

interface BlogIgnoredField {
  ignoredFields?: BlogIgnorableField[],
}
