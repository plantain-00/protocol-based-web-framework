/* eslint-disable */

import type { Readable } from 'stream'
import framework from '../../dist/nodejs/index.js'
const { ajvBackend } = framework
import { Blog, BlogIgnorableField } from "../blog/blog.schema"

export type GetBlogs = <TIgnored extends BlogIgnorableField = never, TPicked extends "posts" | "id" | "content" | "meta" = "posts" | "id" | "content" | "meta">(req: { query: { skip: number, take: number, ignoredFields?: TIgnored[], pickedFields?: TPicked[], sortType: "asc" | "desc", content?: string, sortField: "id" | "content", ids?: string[] }, cookie: { myUserId: number } }) => Promise<{ result: Omit<Pick<Blog, TPicked>, TIgnored>[], count: number }>
export type GetBlogById = <TIgnored extends BlogIgnorableField = never, TPicked extends "posts" | "id" | "content" | "meta" = "posts" | "id" | "content" | "meta">(req: { path: { id: number }, query?: { ignoredFields?: TIgnored[], pickedFields?: TPicked[] }, cookie: { myUserId: number } }) => Promise<{ result?: Omit<Pick<Blog, TPicked>, TIgnored> }>
export type CreateBlog = <TIgnored extends BlogIgnorableField = never, TPicked extends "posts" | "id" | "content" | "meta" = "posts" | "id" | "content" | "meta">(req: { query?: { ignoredFields?: TIgnored[], pickedFields?: TPicked[] }, body: { content: string }, cookie: { myUserId: number } }) => Promise<{ result: Omit<Pick<Blog, TPicked>, TIgnored> }>
export type PatchBlog = <TIgnored extends BlogIgnorableField = never, TPicked extends "posts" | "id" | "content" | "meta" = "posts" | "id" | "content" | "meta">(req: { path: { id: number }, query?: { ignoredFields?: TIgnored[], pickedFields?: TPicked[] }, body?: { content?: string, meta?: unknown }, cookie: { myUserId: number } }) => Promise<{ result: Omit<Pick<Blog, TPicked>, TIgnored> }>
export type DeleteBlog = (req: { path: { id: number }, cookie: { myUserId: number } }) => Promise<{  }>
export type DownloadBlog = (req: { path: { id: number }, query?: { attachmentFileName?: string } }) => Promise<Readable>
export type UploadBlog = (req: { body: { file: Readable, id: number } }) => Promise<{  }>
export type GetBlogText = (req: { path: { id: number } }) => Promise<string>

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
        "pickedFields": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": [
              "posts",
              "id",
              "content",
              "meta"
            ]
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
        },
        "pickedFields": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": [
              "posts",
              "id",
              "content",
              "meta"
            ]
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
        },
        "pickedFields": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": [
              "posts",
              "id",
              "content",
              "meta"
            ]
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
        },
        "pickedFields": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": [
              "posts",
              "id",
              "content",
              "meta"
            ]
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
const downloadBlogValidate = ajvBackend.compile({
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
        "attachmentFileName": {
          "type": "string"
        }
      },
      "required": []
    }
  },
  "required": [
    "path"
  ],
  "definitions": {}
})
const uploadBlogValidate = ajvBackend.compile({
  "type": "object",
  "properties": {
    "body": {
      "type": "object",
      "properties": {
        "file": {},
        "id": {
          "type": "number"
        }
      },
      "required": [
        "file",
        "id"
      ]
    }
  },
  "required": [
    "body"
  ],
  "definitions": {}
})
const getBlogTextValidate = ajvBackend.compile({
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
    }
  },
  "required": [
    "path"
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
  {
    name: 'DownloadBlog',
    method: 'get' as const,
    url: '/api/blogs/:id/download',
    tags: ["blog"],
    validate: downloadBlogValidate,
    handler: undefined as ((req: unknown) => Promise<{} | Readable>) | undefined,
  },
  {
    name: 'UploadBlog',
    method: 'post' as const,
    url: '/api/blogs/upload',
    tags: ["blog"],
    validate: uploadBlogValidate,
    handler: undefined as ((req: unknown) => Promise<{} | Readable>) | undefined,
  },
  {
    name: 'GetBlogText',
    method: 'get' as const,
    url: '/api/blogs/:id/text',
    tags: ["blog"],
    validate: getBlogTextValidate,
    handler: undefined as ((req: unknown) => Promise<{} | Readable>) | undefined,
  },
]

export const bindRestfulApiHandler: {
  (name: 'GetBlogs', req: GetBlogs): void
  (name: 'GetBlogById', req: GetBlogById): void
  (name: 'CreateBlog', req: CreateBlog): void
  (name: 'PatchBlog', req: PatchBlog): void
  (name: 'DeleteBlog', req: DeleteBlog): void
  (name: 'DownloadBlog', req: DownloadBlog): void
  (name: 'UploadBlog', req: UploadBlog): void
  (name: 'GetBlogText', req: GetBlogText): void
} = (name: string, handler: (input: any) => Promise<{} | Readable>) => {
  const schema = apiSchemas.find((s) => s.name === name)
  if (schema) {
    schema.handler = handler
  }
}
