export type GetPageUrl = {
  (url: `/`): string
  (url: `/blogs/${number}`): string
  (url: '/blogs/{id}', args: { path: { id: number } }): string
}

export const routes = [
  {
    name: 'HomePage',
    path: '/',
    Component: undefined as undefined | (() => JSX.Element),
  },
  {
    name: 'BlogPage',
    path: '/blogs/:id',
    Component: undefined as undefined | (() => JSX.Element),
  },
]

export const bindRouterComponent: {
  (name: 'HomePage', component: () => JSX.Element): void
  (name: 'BlogPage', component: () => JSX.Element): void
} = (name: string, component: () => JSX.Element) => {
  const schema = routes.find((s) => s.name === name)
  if (schema) {
    schema.Component = component
  }
}
