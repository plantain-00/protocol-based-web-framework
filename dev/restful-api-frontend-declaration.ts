import { Blog, BlogIgnorableField } from './restful-api-schema'
import { ajvFrontend } from '../dist/browser'

export type RequestRestfulAPI = {
  <TIgnored extends BlogIgnorableField = never, TPicked extends "posts" | "id" | "content" | "meta" = "posts" | "id" | "content" | "meta">(method: 'GET', url: `/api/blogs`, args?: { query?: { skip?: number, take?: number, ignoredFields?: TIgnored[], pickedFields?: TPicked[], sortType?: "asc" | "desc", content?: string, sortField?: "id" | "content", ids?: string[] } }): Promise<{ result: Omit<Pick<Blog, TPicked>, TIgnored>[], count: number }>
  <TIgnored extends BlogIgnorableField = never, TPicked extends "posts" | "id" | "content" | "meta" = "posts" | "id" | "content" | "meta">(method: 'GET', url: `/api/blogs/${number}`, args?: { query?: { ignoredFields?: TIgnored[], pickedFields?: TPicked[] } }): Promise<{ result?: Omit<Pick<Blog, TPicked>, TIgnored> }>
  <TIgnored extends BlogIgnorableField = never, TPicked extends "posts" | "id" | "content" | "meta" = "posts" | "id" | "content" | "meta">(method: 'GET', url: '/api/blogs/{id}', args: { path: { id: number }, query?: { ignoredFields?: TIgnored[], pickedFields?: TPicked[] } }): Promise<{ result?: Omit<Pick<Blog, TPicked>, TIgnored> }>
  <TIgnored extends BlogIgnorableField = never, TPicked extends "posts" | "id" | "content" | "meta" = "posts" | "id" | "content" | "meta">(method: 'POST', url: `/api/blogs`, args: { query?: { ignoredFields?: TIgnored[], pickedFields?: TPicked[] }, body: { content: string } }): Promise<{ result: Omit<Pick<Blog, TPicked>, TIgnored> }>
  <TIgnored extends BlogIgnorableField = never, TPicked extends "posts" | "id" | "content" | "meta" = "posts" | "id" | "content" | "meta">(method: 'PATCH', url: `/api/blogs/${number}`, args?: { query?: { ignoredFields?: TIgnored[], pickedFields?: TPicked[] }, body?: { content?: string, meta?: unknown } }): Promise<{ result: Omit<Pick<Blog, TPicked>, TIgnored> }>
  <TIgnored extends BlogIgnorableField = never, TPicked extends "posts" | "id" | "content" | "meta" = "posts" | "id" | "content" | "meta">(method: 'PATCH', url: '/api/blogs/{id}', args: { path: { id: number }, query?: { ignoredFields?: TIgnored[], pickedFields?: TPicked[] }, body?: { content?: string, meta?: unknown } }): Promise<{ result: Omit<Pick<Blog, TPicked>, TIgnored> }>
  (method: 'DELETE', url: `/api/blogs/${number}`): Promise<{  }>
  (method: 'DELETE', url: '/api/blogs/{id}', args: { path: { id: number } }): Promise<{  }>
}

export type GetRequestApiUrl = {
  <TIgnored extends BlogIgnorableField = never, TPicked extends "posts" | "id" | "content" | "meta" = "posts" | "id" | "content" | "meta">(url: `/api/blogs`, args?: { query?: { skip?: number, take?: number, ignoredFields?: TIgnored[], pickedFields?: TPicked[], sortType?: "asc" | "desc", content?: string, sortField?: "id" | "content", ids?: string[] } }): string
  <TIgnored extends BlogIgnorableField = never, TPicked extends "posts" | "id" | "content" | "meta" = "posts" | "id" | "content" | "meta">(url: `/api/blogs/${number}`, args?: { query?: { ignoredFields?: TIgnored[], pickedFields?: TPicked[] } }): string
  <TIgnored extends BlogIgnorableField = never, TPicked extends "posts" | "id" | "content" | "meta" = "posts" | "id" | "content" | "meta">(url: '/api/blogs/{id}', args: { path: { id: number }, query?: { ignoredFields?: TIgnored[], pickedFields?: TPicked[] } }): string
  <TIgnored extends BlogIgnorableField = never, TPicked extends "posts" | "id" | "content" | "meta" = "posts" | "id" | "content" | "meta">(url: `/api/blogs`, args?: { query?: { ignoredFields?: TIgnored[], pickedFields?: TPicked[] } }): string
  <TIgnored extends BlogIgnorableField = never, TPicked extends "posts" | "id" | "content" | "meta" = "posts" | "id" | "content" | "meta">(url: `/api/blogs/${number}`, args?: { query?: { ignoredFields?: TIgnored[], pickedFields?: TPicked[] } }): string
  <TIgnored extends BlogIgnorableField = never, TPicked extends "posts" | "id" | "content" | "meta" = "posts" | "id" | "content" | "meta">(url: '/api/blogs/{id}', args: { path: { id: number }, query?: { ignoredFields?: TIgnored[], pickedFields?: TPicked[] } }): string
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
    validate: ajvFrontend.compile(getBlogsJsonSchema),
  },
  {
    url: '/api/blogs/{id}',
    method: 'GET',
    schema: getBlogByIdJsonSchema,
    omittedReferences: ['Blog'],
    validate: ajvFrontend.compile(getBlogByIdJsonSchema),
  },
  {
    url: '/api/blogs',
    method: 'POST',
    schema: createBlogJsonSchema,
    omittedReferences: ['Blog'],
    validate: ajvFrontend.compile(createBlogJsonSchema),
  },
  {
    url: '/api/blogs/{id}',
    method: 'PATCH',
    schema: patchBlogJsonSchema,
    omittedReferences: ['Blog'],
    validate: ajvFrontend.compile(patchBlogJsonSchema),
  },
  {
    url: '/api/blogs/{id}',
    method: 'DELETE',
    schema: deleteBlogJsonSchema,
    omittedReferences: [],
    validate: ajvFrontend.compile(deleteBlogJsonSchema),
  },
]
