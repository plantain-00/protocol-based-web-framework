import { ajvRouter, Route } from '../dist/browser'

export type BlogPageProps = { path: { id: number } }

export type GetPageUrl = {
  (url: `/`): string
  (url: `/blogs/${number}`): string
  (url: '/blogs/{id}', args: BlogPageProps): string
}

const homePageValidate = ajvRouter.compile({
  "type": "object",
  "properties": {},
  "required": []
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
  (name: 'HomePage', component: () => JSX.Element): void
  (name: 'BlogPage', component: (props: BlogPageProps) => JSX.Element): void
} = (name: string, component: (props?: any) => JSX.Element) => {
  const schema = routes.find((s) => s.name === name)
  if (schema) {
    schema.Component = component
  }
}
