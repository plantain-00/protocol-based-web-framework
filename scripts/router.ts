import { FunctionParameter, generateTypescriptOfFunctionParameter, TypeDeclaration, getDeclarationParameters } from 'types-as-schema'

export default (typeDeclarations: TypeDeclaration[]): { path: string, content: string }[] => {
  const getPageUrlResult: string[] = []
  const routers: string[] = []
  const bindPageComponentTypes: string[] = []

  function getParam(type: typeof allTypes[number], parameter: FunctionParameter[]) {
    const optional = parameter.every((q) => q.optional) ? '?' : ''
    return {
      optional: parameter.every((q) => q.optional),
      value: `${type}${optional}: { ${parameter.map((q) => {
        return generateTypescriptOfFunctionParameter(q)
      }).join(', ')} }`
    }
  }

  for (const declaration of typeDeclarations) {
    if (declaration.kind === 'function' && declaration.path) {
      // register
      let path = declaration.path
      const declarationParameters = getDeclarationParameters(declaration, typeDeclarations)
      for (const parameter of declarationParameters) {
        if (parameter.in === 'path') {
          path = path.split(`{${parameter.name}}`).join(`:${parameter.name}`)
        }
      }
      const interfaceName = declaration.name[0].toUpperCase() + declaration.name.substring(1)
      bindPageComponentTypes.push(`  (name: '${interfaceName}', component: () => JSX.Element): void`)
      routers.push(`  {
    name: '${interfaceName}',
    path: '${path}',
    Component: undefined as undefined | (() => JSX.Element),
  },`)

      // frontend types
      const frontendParams: { optional: boolean, value: string }[] = []
      const frontendPathParams: { optional: boolean, value: string }[] = []
      const getPageUrlParam: { optional: boolean, value: string }[] = []
      const getPageUrlPathParam: { optional: boolean, value: string }[] = []
      let frontendPath = declaration.path
      for (const type of allTypes) {
        const parameter = declarationParameters.filter((d) => d.in === type)
        if (parameter.length > 0) {
          if (type === 'query') {
            getPageUrlParam.push(getParam(type, parameter))
          } else {
            getPageUrlPathParam.push(getParam(type, parameter))
          }
          if (type === 'query') {
            frontendParams.push(getParam(type, parameter))
          } else {
            frontendPathParams.push(getParam(type, parameter))
          }
          parameter.forEach((q) => {
            if (q.type.default !== undefined) {
              q.optional = false
            }
            if (type === 'path') {
              frontendPath = frontendPath.split(`{${q.name}}`).join(`\${${q.type.kind}}`)
            }
          })
        }
      }
      const frontendParameters = [
        `url: \`${frontendPath}\``,
      ]
      const frontendParameters2: string[] = []
      if (frontendPathParams.length > 0) {
        frontendParameters2.push(
          `url: '${declaration.path}'`,
        )
      }
      if (frontendParams.length > 0) {
        const optional = frontendParams.every((q) => q.optional) ? '?' : ''
        frontendParameters.push(`args${optional}: { ${frontendParams.map((p) => p.value).join(', ')} }`)
      }
      if (frontendPathParams.length > 0) {
        const optional = frontendParams.every((q) => q.optional) && frontendPathParams.every((q) => q.optional) ? '?' : ''
        frontendParameters2.push(`args${optional}: { ${[...frontendPathParams, ...frontendParams].map((p) => p.value).join(', ')} }`)
      }
      const getPageUrlParameters = [
        `url: \`${frontendPath}\``,
      ]
      const getPageUrlParameters2: string[] = []
      if (getPageUrlPathParam.length > 0) {
        getPageUrlParameters2.push(
          `url: '${declaration.path}'`,
        )
      }
      if (getPageUrlParam.length > 0) {
        const optional = getPageUrlParam.every((q) => q.optional) ? '?' : ''
        getPageUrlParameters.push(`args${optional}: { ${getPageUrlParam.map((p) => p.value).join(', ')} }`)
      }
      if (getPageUrlPathParam.length > 0) {
        const optional = getPageUrlParam.every((q) => q.optional) && getPageUrlPathParam.every((q) => q.optional) ? '?' : ''
        getPageUrlParameters2.push(`args${optional}: { ${[...getPageUrlPathParam, ...getPageUrlParam].map((p) => p.value).join(', ')} }`)
      }

      getPageUrlResult.push(`  (${getPageUrlParameters.join(', ')}): string`)
      if (getPageUrlParameters2.length > 0) {
        getPageUrlResult.push(`  (${getPageUrlParameters2.join(', ')}): string`)
      }
    }
  }
  
  const content = `export type GetPageUrl = {
${getPageUrlResult.join('\n')}
}

export const routes = [
${routers.join('\n')}
]

export const bindRouterComponent: {
${bindPageComponentTypes.join('\n')}
} = (name: string, component: () => JSX.Element) => {
  const schema = routes.find((s) => s.name === name)
  if (schema) {
    schema.Component = component
  }
}
`
  return [
    {
      path: process.env.OUTPUT_PATH || './static/router-declaration.ts',
      content,
    },
  ]
}

const allTypes = ['path', 'query'] as const
