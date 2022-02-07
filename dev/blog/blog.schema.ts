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
type getBlogs = (
  query: PaginationFields & BlogFieldFilter & SortTypeField & {
    content?: string
    /**
     * @default id
     */
    sortField?: 'id' | 'content'
    ids?: string[]
  },
  cookie: MyUserIdField,
) => { result: Blog[], count: number }

/**
 * @method get
 * @path /api/blogs/{id}
 * @tags blog
 */
type getBlogById = (
  query: BlogFieldFilter,
  path: IdField,
  cookie: MyUserIdField,
) => { result?: Blog }

/**
 * @method post
 * @path /api/blogs
 * @tags blog
 */
type createBlog = (
  query: BlogFieldFilter,
  body: {
    content: string
  },
  cookie: MyUserIdField,
) => { result: Blog }

/**
 * @method patch
 * @path /api/blogs/{id}
 * @tags blog
 */
type patchBlog = (
  query: BlogFieldFilter,
  path: IdField,
  body: {
    content?: string
    meta?: unknown
  },
  cookie: MyUserIdField,
) => { result: Blog }

/**
 * @method delete
 * @path /api/blogs/{id}
 * @tags blog
 */
type deleteBlog = (
  path: IdField,
  cookie: MyUserIdField,
) => {}

/**
 * @method get
 * @path /api/blogs/{id}/download
 * @tags blog
 */
type downloadBlog = (
  path: IdField,
  query: {
    attachmentFileName?: string,
  },
) => File

/**
 * @method post
 * @path /api/blogs/upload
 * @tags blog
 */
type uploadBlog = (
  body: {
    file: File,
    id: number,
  },
) => {}

/**
 * @method get
 * @path /api/blogs/{id}/text
 * @tags blog
 */
type getBlogText = (
  path: IdField,
) => string

export type BlogIgnorableField = 'posts' | 'meta'

/**
 * @localStorage
 */
export interface Blog extends BlogSchema {
  posts: PostSchema[]
}

interface BlogFieldFilter {
  /**
   * @description ignored fields will not in response
   */
  ignoredFields?: BlogIgnorableField[]
  /**
   * @description only picked fields will be in response
   */
  pickedFields?: (keyof Blog)[]
}

/**
 * @route /blogs/{id}
 */
export interface BlogPageProps {
  path: {
    id: number
  }
}
