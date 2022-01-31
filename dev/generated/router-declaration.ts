import { ajv, Route } from '@protocol-based-web-framework/router'

export type BlogPageProps = { path: { id: number } }
export type HomePageProps = { query: { page: number } }

export interface GetPageUrl {
  (url: `/blogs/${number}`): string
  (url: '/blogs/{id}', args: { path: { id: number } }): string
  (url: `/`, args?: { query?: { page?: number } }): string
}

const blogPageValidate = ajv.compile({
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
})
const homePageValidate = ajv.compile({
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
      "required": [
        "page"
      ]
    }
  },
  "required": [
    "query"
  ]
})

export const routes: Route[] = [
  {
    name: 'BlogPage',
    path: '/blogs/:id',
    regexp: /^\/blogs(?:\/([^\/#\?]+?))[\/#\?]?$/i,
    keys: ['id'],
    validate: blogPageValidate,
  },
  {
    name: 'HomePage',
    path: '/',
    regexp: undefined,
    keys: [],
    validate: homePageValidate,
  },
]

export const bindRouterComponent: {
  (name: 'BlogPage', component: (props: BlogPageProps) => JSX.Element): void
  (name: 'HomePage', component: (props: HomePageProps) => JSX.Element): void
} = (name: string, component: (props: any) => JSX.Element) => {
  const schema = routes.find((s) => s.name === name)
  if (schema) {
    schema.Component = component
  }
}
