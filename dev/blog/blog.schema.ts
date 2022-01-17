import { PostSchema } from "../post/post.schema";
import { IdField, MyUserIdField, PaginationFields, SortTypeField } from "../shared/shared.schema";

/**
 * @entry blogs
 */
export interface BlogSchema {
  /**
   * @autoincrement
   */
  id: number
  content: string
  meta: unknown
}

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

interface BlogFieldFilter {
  ignoredFields?: BlogIgnorableField[]
  pickedFields?: (keyof Blog)[]
}

/**
 * @path /blogs/{id}
 */
declare function blogPage(path: { id: number }): string
