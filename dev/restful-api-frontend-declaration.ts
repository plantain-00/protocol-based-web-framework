import { Blog, BlogIgnorableField } from './restful-api-schema'
import { ajv } from '../dist/nodejs/restful-api-frontend-declaration-lib'

export type RequestRestfulAPI = {
  <T extends BlogIgnorableField = never>(method: 'GET', url: `/api/blogs`, args?: { query?: { skip?: number, take?: number, content?: string, sortField?: "id" | "content", sortType?: "asc" | "desc", ignoredFields?: T[], ids?: string[] } }): Promise<{ result: Omit<Blog, T>[], count: number }>
  <T extends BlogIgnorableField = never>(method: 'GET', url: `/api/blogs/${number}`, args?: { query?: { ignoredFields?: T[] } }): Promise<{ result?: Omit<Blog, T> }>
  <T extends BlogIgnorableField = never>(method: 'GET', url: '/api/blogs/{id}', args: { path: { id: number }, query?: { ignoredFields?: T[] } }): Promise<{ result?: Omit<Blog, T> }>
  <T extends BlogIgnorableField = never>(method: 'POST', url: `/api/blogs`, args: { query?: { ignoredFields?: T[] }, body: { content: string } }): Promise<{ result: Omit<Blog, T> }>
  <T extends BlogIgnorableField = never>(method: 'PATCH', url: `/api/blogs/${number}`, args?: { query?: { ignoredFields?: T[] }, body?: { content?: string, meta?: unknown } }): Promise<{ result: Omit<Blog, T> }>
  <T extends BlogIgnorableField = never>(method: 'PATCH', url: '/api/blogs/{id}', args: { path: { id: number }, query?: { ignoredFields?: T[] }, body?: { content?: string, meta?: unknown } }): Promise<{ result: Omit<Blog, T> }>
  (method: 'DELETE', url: `/api/blogs/${number}`): Promise<{  }>
  (method: 'DELETE', url: '/api/blogs/{id}', args: { path: { id: number } }): Promise<{  }>
}

export type GetRequestApiUrl = {
  <T extends BlogIgnorableField = never>(url: `/api/blogs`, args?: { query?: { skip?: number, take?: number, content?: string, sortField?: "id" | "content", sortType?: "asc" | "desc", ignoredFields?: T[], ids?: string[] } }): string
  <T extends BlogIgnorableField = never>(url: `/api/blogs/${number}`, args?: { query?: { ignoredFields?: T[] } }): string
  <T extends BlogIgnorableField = never>(url: '/api/blogs/{id}', args: { path: { id: number }, query?: { ignoredFields?: T[] } }): string
  <T extends BlogIgnorableField = never>(url: `/api/blogs`, args?: { query?: { ignoredFields?: T[] } }): string
  <T extends BlogIgnorableField = never>(url: `/api/blogs/${number}`, args?: { query?: { ignoredFields?: T[] } }): string
  <T extends BlogIgnorableField = never>(url: '/api/blogs/{id}', args: { path: { id: number }, query?: { ignoredFields?: T[] } }): string
  (url: `/api/blogs/${number}`): string
  (url: '/api/blogs/{id}', args: { path: { id: number } }): string
}

const getBlogsJsonSchema = {
  "type": "object",
  "properties": {
    "result": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/Blog"
      }
    },
    "count": {
      "type": "number"
    }
  },
  "required": [
    "result",
    "count"
  ],
  "definitions": {
    "Blog": {
      "type": "object",
      "properties": {
        "posts": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/PostSchema"
          }
        },
        "id": {
          "type": "number"
        },
        "content": {
          "type": "string"
        },
        "meta": {}
      },
      "required": [
        "posts",
        "id",
        "content",
        "meta"
      ]
    },
    "PostSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "number"
        },
        "content": {
          "type": "string"
        },
        "blogId": {
          "type": "number"
        }
      },
      "required": [
        "id",
        "content",
        "blogId"
      ]
    }
  }
}
const getBlogByIdJsonSchema = {
  "type": "object",
  "properties": {
    "result": {
      "$ref": "#/definitions/Blog"
    }
  },
  "required": [],
  "definitions": {
    "Blog": {
      "type": "object",
      "properties": {
        "posts": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/PostSchema"
          }
        },
        "id": {
          "type": "number"
        },
        "content": {
          "type": "string"
        },
        "meta": {}
      },
      "required": [
        "posts",
        "id",
        "content",
        "meta"
      ]
    },
    "PostSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "number"
        },
        "content": {
          "type": "string"
        },
        "blogId": {
          "type": "number"
        }
      },
      "required": [
        "id",
        "content",
        "blogId"
      ]
    }
  }
}
const createBlogJsonSchema = {
  "type": "object",
  "properties": {
    "result": {
      "$ref": "#/definitions/Blog"
    }
  },
  "required": [
    "result"
  ],
  "definitions": {
    "Blog": {
      "type": "object",
      "properties": {
        "posts": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/PostSchema"
          }
        },
        "id": {
          "type": "number"
        },
        "content": {
          "type": "string"
        },
        "meta": {}
      },
      "required": [
        "posts",
        "id",
        "content",
        "meta"
      ]
    },
    "PostSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "number"
        },
        "content": {
          "type": "string"
        },
        "blogId": {
          "type": "number"
        }
      },
      "required": [
        "id",
        "content",
        "blogId"
      ]
    }
  }
}
const patchBlogJsonSchema = {
  "type": "object",
  "properties": {
    "result": {
      "$ref": "#/definitions/Blog"
    }
  },
  "required": [
    "result"
  ],
  "definitions": {
    "Blog": {
      "type": "object",
      "properties": {
        "posts": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/PostSchema"
          }
        },
        "id": {
          "type": "number"
        },
        "content": {
          "type": "string"
        },
        "meta": {}
      },
      "required": [
        "posts",
        "id",
        "content",
        "meta"
      ]
    },
    "PostSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "number"
        },
        "content": {
          "type": "string"
        },
        "blogId": {
          "type": "number"
        }
      },
      "required": [
        "id",
        "content",
        "blogId"
      ]
    }
  }
}
const deleteBlogJsonSchema = {
  "type": "object",
  "properties": {},
  "required": [],
  "definitions": {}
}

export const validations = [
  {
    url: '/api/blogs',
    method: 'GET',
    schema: getBlogsJsonSchema,
    omittedReferences: ['Blog'],
    validate: ajv.compile(getBlogsJsonSchema),
  },
  {
    url: '/api/blogs/{id}',
    method: 'GET',
    schema: getBlogByIdJsonSchema,
    omittedReferences: ['Blog'],
    validate: ajv.compile(getBlogByIdJsonSchema),
  },
  {
    url: '/api/blogs',
    method: 'POST',
    schema: createBlogJsonSchema,
    omittedReferences: ['Blog'],
    validate: ajv.compile(createBlogJsonSchema),
  },
  {
    url: '/api/blogs/{id}',
    method: 'PATCH',
    schema: patchBlogJsonSchema,
    omittedReferences: ['Blog'],
    validate: ajv.compile(patchBlogJsonSchema),
  },
  {
    url: '/api/blogs/{id}',
    method: 'DELETE',
    schema: deleteBlogJsonSchema,
    omittedReferences: [],
    validate: ajv.compile(deleteBlogJsonSchema),
  },
]
