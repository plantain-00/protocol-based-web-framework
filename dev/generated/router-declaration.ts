import { ajv, Route } from '@protocol-based-web-framework/router'
import { BlogPageProps } from "../blog/blog.schema"
import { HomePageProps } from "../home/home.schema"

export interface GetPageUrl {
  (url: `/blogs/${number}`): string
  (url: '/blogs/{id}', args: { path: { id: number } }): string
  (url: `/`, args?: { query?: { page?: number } }): string
}

export const routes: Route[] = [
  {
    name: '',
    path: '/blogs/:id',
    regexp: /^\/blogs(?:\/([^\/#\?]+?))[\/#\?]?$/i,
    keys: ['id'],
    validate: ajv.compile({
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
  ]
}),
  },
  {
    name: '',
    path: '/',
    regexp: undefined,
    keys: [],
    validate: ajv.compile({
  "type": "object",
  "properties": {
    "query": {
      "type": "object",
      "properties": {
        "page": {
          "type": "number",
          "default": 1
        }
      },
      "required": []
    }
  },
  "required": []
}),
  },
]

export const bindRouterComponent: {
  (path: '/blogs/:id', component: (props: BlogPageProps) => JSX.Element): void
  (path: '/', component: (props: HomePageProps) => JSX.Element): void
} = (path: string, component: (props: any) => JSX.Element) => {
  const schema = routes.find((s) => s.path === path || s.name === path)
  if (schema) {
    schema.Component = component
  }
}
