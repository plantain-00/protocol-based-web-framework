import { ajv } from '@protocol-based-web-framework/browser-storage'
import { Blog } from "../blog/blog.schema"
import { PostSchema } from "../post/post.schema"

export interface GetItem {
  (key: "Blog"): Blog
  (key: "post-key"): PostSchema
}

export interface SetItem {
  (key: "Blog", value: Blog): void
  (key: "post-key", value: PostSchema): void
}

export interface RemoveItem {
  (key: "Blog"): void
  (key: "post-key"): void
}

const BlogValidate = ajv.compile({
  "$ref": "#/definitions/Blog",
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
})
const PostSchemaValidate = ajv.compile({
  "$ref": "#/definitions/PostSchema",
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
