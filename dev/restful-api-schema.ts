import { BlogSchema, PostSchema } from "./db-schema"

/**
 * @method get
 * @path /api/blogs
 * @tags blog
 */
declare function getBlogs(
  query: PaginationFields & BlogFieldFilter & SortTypeField & {
    content?: string
    /**
     * @default id
     */
    sortField?: 'id' | 'content'
    ids?: string[]
  },
  cookie: MyUserIdField,
): Promise<{ result: Blog[], count: number }>

/**
 * @method get
 * @path /api/blogs/{id}
 * @tags blog
 */
declare function getBlogById(
  query: BlogFieldFilter,
  path: IdField,
  cookie: MyUserIdField,
): Promise<{ result?: Blog }>

/**
 * @method post
 * @path /api/blogs
 * @tags blog
 */
declare function createBlog(
  query: BlogFieldFilter,
  body: {
    content: string
  },
  cookie: MyUserIdField,
): Promise<{ result: Blog }>

/**
 * @method patch
 * @path /api/blogs/{id}
 * @tags blog
 */
declare function patchBlog(
  query: BlogFieldFilter,
  path: IdField,
  body: {
    content?: string
    meta?: unknown
  },
  cookie: MyUserIdField,
): Promise<{ result: Blog }>

/**
 * @method delete
 * @path /api/blogs/{id}
 * @tags blog
 */
declare function deleteBlog(
  path: IdField,
  cookie: MyUserIdField,
): Promise<{}>

/**
 * @method get
 * @path /api/blogs/{id}/download
 * @tags blog
 */
 declare function downloadBlog(
  path: IdField,
  query: {
    attachmentFileName?: string,
  },
): Promise<File>

/**
 * @method post
 * @path /api/blogs/upload
 * @tags blog
 */
declare function uploadBlog(
  body: {
    file: File,
    id: number,
  },
): Promise<{}>

/**
 * @method get
 * @path /api/blogs/{id}/text
 * @tags blog
 */
declare function getBlogText(
  path: IdField,
): Promise<string>

export type BlogIgnorableField = 'posts' | 'meta'

export interface Blog extends BlogSchema {
  posts: PostSchema[]
}

interface PaginationFields {
  /**
   * @default 0
   */
  skip?: number
  /**
   * @default 10
   */
  take?: number
}

interface SortTypeField {
  /**
   * @default asc
   */
  sortType?: 'asc' | 'desc'
}

interface IdField {
  id: number
}

interface BlogFieldFilter {
  ignoredFields?: BlogIgnorableField[]
  pickedFields?: (keyof Blog)[]
}

interface MyUserIdField {
  myUserId: number
}
