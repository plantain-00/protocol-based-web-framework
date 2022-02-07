import { ajv } from '@protocol-based-web-framework/browser-storage'
import { PostSchema } from "../post/post.schema"

export interface GetItem {
  (key: "Blog"): { posts: PostSchema[], id: number, content: string, meta: unknown }
  (key: "post-key"): { id: number, content: string, blogId: number }
}

export interface SetItem {
  (key: "Blog", value: { posts: PostSchema[], id: number, content: string, meta: unknown }): void
  (key: "post-key", value: { id: number, content: string, blogId: number }): void
}

export interface RemoveItem {
  (key: "Blog"): void
  (key: "post-key"): void
}

const BlogValidate = ajv.compile({
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
  ],
  "definitions": {
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
})
const PostSchemaValidate = ajv.compile({
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
  ],
  "definitions": {}
})

export const validations = [
  {
    key: "Blog",
    validate: BlogValidate,
  },
  {
    key: "post-key",
    validate: PostSchemaValidate,
  },
]
