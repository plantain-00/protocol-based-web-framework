/* eslint-disable */

import type { Application } from 'express'
import { ajvBackend, HandleHttpRequest } from '../dist/nodejs'
import { Blog, BlogIgnorableField } from './restful-api-schema'

export type GetBlogs = <T extends BlogIgnorableField = never>(req: { query: { skip: number, take: number, content?: string, sortField: "id" | "content", sortType: "asc" | "desc", ignoredFields?: T[], ids?: string[] } }) => Promise<{ result: Omit<Blog, T>[], count: number }>
export type GetBlogById = <T extends BlogIgnorableField = never>(req: { path: { id: number }, query?: { ignoredFields?: T[] } }) => Promise<{ result?: Omit<Blog, T> }>
export type CreateBlog = <T extends BlogIgnorableField = never>(req: { query?: { ignoredFields?: T[] }, body: { content: string } }) => Promise<{ result: Omit<Blog, T> }>
export type PatchBlog = <T extends BlogIgnorableField = never>(req: { path: { id: number }, query?: { ignoredFields?: T[] }, body?: { content?: string, meta?: unknown } }) => Promise<{ result: Omit<Blog, T> }>
export type DeleteBlog = (req: { path: { id: number } }) => Promise<{  }>

const getBlogsValidate = ajvBackend.compile({
  "type": "object",
  "properties": {
    "path": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "query": {
      "type": "object",
      "properties": {
        "skip": {
          "type": "number",
          "default": 0
        },
        "take": {
          "type": "number",
          "default": 10
        },
        "content": {
          "type": "string"
        },
        "sortField": {
          "type": "string",
          "enum": [
            "id",
            "content"
          ],
          "default": "id"
        },
        "sortType": {
          "type": "string",
          "enum": [
            "asc",
            "desc"
          ],
          "default": "asc"
        },
        "ignoredFields": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/BlogIgnorableField"
          }
        },
        "ids": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      },
      "required": []
    },
    "body": {
      "type": "object",
      "properties": {},
      "required": []
    }
  },
  "required": [],
  "definitions": {
    "BlogIgnorableField": {
      "type": "string",
      "enum": [
        "posts",
        "meta"
      ]
    }
  }
})
const getBlogByIdValidate = ajvBackend.compile({
  "type": "object",
  "properties": {
    "path": {
      "type": "object",
      "properties": {
        "id": {
          "type": "number"
        }
      },
      "required": [
        "id"
      ]
    },
    "query": {
      "type": "object",
      "properties": {
        "ignoredFields": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/BlogIgnorableField"
          }
        }
      },
      "required": []
    },
    "body": {
      "type": "object",
      "properties": {},
      "required": []
    }
  },
  "required": [
    "path"
  ],
  "definitions": {
    "BlogIgnorableField": {
      "type": "string",
      "enum": [
        "posts",
        "meta"
      ]
    }
  }
})
const createBlogValidate = ajvBackend.compile({
  "type": "object",
  "properties": {
    "path": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "query": {
      "type": "object",
      "properties": {
        "ignoredFields": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/BlogIgnorableField"
          }
        }
      },
      "required": []
    },
    "body": {
      "type": "object",
      "properties": {
        "content": {
          "type": "string"
        }
      },
      "required": [
        "content"
      ]
    }
  },
  "required": [
    "body"
  ],
  "definitions": {
    "BlogIgnorableField": {
      "type": "string",
      "enum": [
        "posts",
        "meta"
      ]
    }
  }
})
const patchBlogValidate = ajvBackend.compile({
  "type": "object",
  "properties": {
    "path": {
      "type": "object",
      "properties": {
        "id": {
          "type": "number"
        }
      },
      "required": [
        "id"
      ]
    },
    "query": {
      "type": "object",
      "properties": {
        "ignoredFields": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/BlogIgnorableField"
          }
        }
      },
      "required": []
    },
    "body": {
      "type": "object",
      "properties": {
        "content": {
          "type": "string"
        },
        "meta": {}
      },
      "required": []
    }
  },
  "required": [
    "path"
  ],
  "definitions": {
    "BlogIgnorableField": {
      "type": "string",
      "enum": [
        "posts",
        "meta"
      ]
    }
  }
})
const deleteBlogValidate = ajvBackend.compile({
  "type": "object",
  "properties": {
    "path": {
      "type": "object",
      "properties": {
        "id": {
          "type": "number"
        }
      },
      "required": [
        "id"
      ]
    },
    "query": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "body": {
      "type": "object",
      "properties": {},
      "required": []
    }
  },
  "required": [
    "path"
  ],
  "definitions": {}
})

export const registerGetBlogs = (app: Application, handleHttpRequest: HandleHttpRequest, handler: GetBlogs) => handleHttpRequest(app, 'get', '/api/blogs', 'blog', getBlogsValidate, handler)
export const registerGetBlogById = (app: Application, handleHttpRequest: HandleHttpRequest, handler: GetBlogById) => handleHttpRequest(app, 'get', '/api/blogs/:id', 'blog', getBlogByIdValidate, handler)
export const registerCreateBlog = (app: Application, handleHttpRequest: HandleHttpRequest, handler: CreateBlog) => handleHttpRequest(app, 'post', '/api/blogs', 'blog', createBlogValidate, handler)
export const registerPatchBlog = (app: Application, handleHttpRequest: HandleHttpRequest, handler: PatchBlog) => handleHttpRequest(app, 'patch', '/api/blogs/:id', 'blog', patchBlogValidate, handler)
export const registerDeleteBlog = (app: Application, handleHttpRequest: HandleHttpRequest, handler: DeleteBlog) => handleHttpRequest(app, 'delete', '/api/blogs/:id', 'blog', deleteBlogValidate, handler)