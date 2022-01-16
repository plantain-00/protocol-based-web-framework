import { ajvRouter, Route } from '../dist/browser'

export type HomePageProps = { query: { page: number } }
export type BlogPageProps = { path: { id: number } }

export interface GetPageUrl {
  (url: `/`, args?: { query?: { page?: number } }): string
  (url: `/blogs/${number}`): string
  (url: '/blogs/{id}', args: { path: { id: number } }): string
}

const homePageValidate = ajvRouter.compile({
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
const blogPageValidate = ajvRouter.compile({
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

export const routes: Route[] = [
  {
    name: 'HomePage',
    path: '/',
    regexp: undefined,
    keys: [],
    validate: homePageValidate,
  },
  {
    name: 'BlogPage',
    path: '/blogs/:id',
    regexp: /^\/blogs(?:\/([^\/#\?]+?))[\/#\?]?$/i,
    keys: ['id'],
    validate: blogPageValidate,
  },
]

export const bindRouterComponent: {
  (name: 'HomePage', component: (props: HomePageProps) => JSX.Element): void
  (name: 'BlogPage', component: (props: BlogPageProps) => JSX.Element): void
} = (name: string, component: (props: any) => JSX.Element) => {
  const schema = routes.find((s) => s.name === name)
  if (schema) {
    schema.Component = component
  }
}
