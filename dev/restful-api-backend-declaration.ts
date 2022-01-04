/* eslint-disable */

import type { Readable } from 'stream'
import { ajvBackend } from '../dist/nodejs'
import { Blog, BlogIgnorableField } from './restful-api-schema'

export type GetBlogs = <T extends BlogIgnorableField = never>(req: { query: { skip: number, take: number, ignoredFields?: T[], sortType: "asc" | "desc", content?: string, sortField: "id" | "content", ids?: string[] }, cookie: { myUserId: number } }) => Promise<{ result: Omit<Blog, T>[], count: number }>
export type GetBlogById = <T extends BlogIgnorableField = never>(req: { path: { id: number }, query?: { ignoredFields?: T[] }, cookie: { myUserId: number } }) => Promise<{ result?: Omit<Blog, T> }>
export type CreateBlog = <T extends BlogIgnorableField = never>(req: { query?: { ignoredFields?: T[] }, body: { content: string }, cookie: { myUserId: number } }) => Promise<{ result: Omit<Blog, T> }>
export type PatchBlog = <T extends BlogIgnorableField = never>(req: { path: { id: number }, query?: { ignoredFields?: T[] }, body?: { content?: string, meta?: unknown }, cookie: { myUserId: number } }) => Promise<{ result: Omit<Blog, T> }>
export type DeleteBlog = (req: { path: { id: number }, cookie: { myUserId: number } }) => Promise<{  }>

const getBlogsValidate = ajvBackend.compile({
  "type": "object",
  "properties": {
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
        "ignoredFields": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/BlogIgnorableField"
          }
        },
        "sortType": {
          "type": "string",
          "enum": [
            "asc",
            "desc"
          ],
          "default": "asc"
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
        "ids": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      },
      "required": []
    },
    "cookie": {
      "type": "object",
      "properties": {
        "myUserId": {
          "type": "number"
        }
      },
      "required": [
        "myUserId"
      ]
    }
  },
  "required": [
    "cookie"
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
    "cookie": {
      "type": "object",
      "properties": {
        "myUserId": {
          "type": "number"
        }
      },
      "required": [
        "myUserId"
      ]
    }
  },
  "required": [
    "path",
    "cookie"
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
    },
    "cookie": {
      "type": "object",
      "properties": {
        "myUserId": {
          "type": "number"
        }
      },
      "required": [
        "myUserId"
      ]
    }
  },
  "required": [
    "body",
    "cookie"
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
    },
    "cookie": {
      "type": "object",
      "properties": {
        "myUserId": {
          "type": "number"
        }
      },
      "required": [
        "myUserId"
      ]
    }
  },
  "required": [
    "path",
    "cookie"
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
    "cookie": {
      "type": "object",
      "properties": {
        "myUserId": {
          "type": "number"
        }
      },
      "required": [
        "myUserId"
      ]
    }
  },
  "required": [
    "path",
    "cookie"
  ],
  "definitions": {}
})

export const apiSchemas = [
  {
    name: 'GetBlogs',
    method: 'get' as const,
    url: '/api/blogs',
    tags: ["blog"],
    validate: getBlogsValidate,
    handler: undefined as ((req: unknown) => Promise<{} | Readable>) | undefined,
  },
  {
    name: 'GetBlogById',
    method: 'get' as const,
    url: '/api/blogs/:id',
    tags: ["blog"],
    validate: getBlogByIdValidate,
    handler: undefined as ((req: unknown) => Promise<{} | Readable>) | undefined,
  },
  {
    name: 'CreateBlog',
    method: 'post' as const,
    url: '/api/blogs',
    tags: ["blog"],
    validate: createBlogValidate,
    handler: undefined as ((req: unknown) => Promise<{} | Readable>) | undefined,
  },
  {
    name: 'PatchBlog',
    method: 'patch' as const,
    url: '/api/blogs/:id',
    tags: ["blog"],
    validate: patchBlogValidate,
    handler: undefined as ((req: unknown) => Promise<{} | Readable>) | undefined,
  },
  {
    name: 'DeleteBlog',
    method: 'delete' as const,
    url: '/api/blogs/:id',
    tags: ["blog"],
    validate: deleteBlogValidate,
    handler: undefined as ((req: unknown) => Promise<{} | Readable>) | undefined,
  },
]

export const bindRestfulApiHandler: {
  (name: 'GetBlogs', req: GetBlogs): void
  (name: 'GetBlogById', req: GetBlogById): void
  (name: 'CreateBlog', req: CreateBlog): void
  (name: 'PatchBlog', req: PatchBlog): void
  (name: 'DeleteBlog', req: DeleteBlog): void
} = (name: string, handler: (input: any) => Promise<{} | Readable>) => {
  const schema = apiSchemas.find((s) => s.name === name)
  if (schema) {
    schema.handler = handler
  }
}
