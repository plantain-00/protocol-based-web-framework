import { FunctionParameter, generateTypescriptOfFunctionParameter, TypeDeclaration, getDeclarationParameters, getJsonSchemaProperty, Member } from 'types-as-schema'
import { pathToRegexp, Key } from 'path-to-regexp'

export default (typeDeclarations: TypeDeclaration[]): { path: string, content: string }[] => {
  const getPageUrlResult: string[] = []
  const requestJsonSchemas: Array<{ name: string, schema: string }> = []
  const routers: string[] = []
  const bindPageComponentTypes: string[] = []
  const props: string[] = []

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
    if (declaration.kind === 'function' && declaration.path && !declaration.method) {
      // register
      let path = declaration.path
      const declarationParameters = getDeclarationParameters(declaration, typeDeclarations)
      for (const parameter of declarationParameters) {
        if (parameter.in === 'path') {
          path = path.split(`{${parameter.name}}`).join(`:${parameter.name}`)
        }
      }
      const interfaceName = declaration.name[0].toUpperCase() + declaration.name.substring(1)

      let regexp = declaration.path
      const pathParameters = declarationParameters.filter((p) => p.in === 'path')
      pathParameters.forEach((p) => {
        regexp = regexp.split(`{${p.name}}`).join(`:${p.name}`)
      })
      const keys: Key[] = []
      const regexpString = pathParameters.length > 0 ? pathToRegexp(regexp, keys) : undefined

      routers.push(`  {
    name: '${interfaceName}',
    path: '${path}',
    regexp: ${regexpString ? regexpString : 'undefined'},
    keys: [${keys.map((f) => `'${f.name}'`).join(', ')}],
    validate: ${declaration.name}Validate,
  },`)

      // frontend types
      const propsParams: { optional: boolean, value: string }[] = []
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
          parameter.forEach((q) => {
            if (q.type.default !== undefined) {
              q.optional = false
            }
            if (type === 'path') {
              frontendPath = frontendPath.split(`{${q.name}}`).join(`\${${q.type.kind}}`)
            }
          })
          propsParams.push(getParam(type, parameter))
        }
      }

      // json schema
      const members: Member[] = []
      for (const type of allTypes) {
        const params = declarationParameters.filter((d) => d.in === type)
        if (params.length > 0) {
          members.push({
            name: type,
            type: {
              kind: 'object',
              members: params,
              minProperties: params.filter((p) => !p.optional).length,
              position: {
                file: '',
                line: 0,
                character: 0,
              }
            },
            optional: params.every((p) => p.optional),
          })
        }
      }
      requestJsonSchemas.push({
        name: declaration.name,
        schema: JSON.stringify({
          ...getJsonSchemaProperty(
            {
              kind: 'object',
              members,
              minProperties: members.filter((m) => !m.optional).length,
              position: {
                file: '',
                line: 0,
                character: 0,
              }
            },
            { declarations: typeDeclarations, looseMode: true }
          ),
        }, null, 2)
      })

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
      if (getPageUrlPathParam.length) {
        const optional = getPageUrlParam.every((q) => q.optional) && getPageUrlPathParam.every((q) => q.optional) ? '?' : ''
        getPageUrlParameters2.push(`args${optional}: { ${[...getPageUrlPathParam, ...getPageUrlParam].map((p) => p.value).join(', ')} }`)
      }
      if (getPageUrlPathParam.length + getPageUrlParam.length > 0) {
        bindPageComponentTypes.push(`  (name: '${interfaceName}', component: (props: ${interfaceName}Props) => JSX.Element): void`)
      } else {
        bindPageComponentTypes.push(`  (name: '${interfaceName}', component: () => JSX.Element): void`)
      }

      if (propsParams.length > 0) {
        props.push(`export type ${interfaceName}Props = { ${propsParams.map((p) => p.value).join(', ')} }`)
      }

      getPageUrlResult.push(`  (${getPageUrlParameters.join(', ')}): string`)
      if (getPageUrlParameters2.length > 0) {
        getPageUrlResult.push(`  (${getPageUrlParameters2.join(', ')}): string`)
      }
    }
  }

  const content = `import { ajvRouter, Route } from '${process.env.ROUTER_DECLARATION_LIB_PATH || 'protocol-based-web-framework'}'

${props.join('\n')}

export interface GetPageUrl {
${getPageUrlResult.join('\n')}
}

${requestJsonSchemas.map((s) => `const ${s.name}Validate = ajvRouter.compile(${s.schema})`).join('\n')}

export const routes: Route[] = [
${routers.join('\n')}
]

export const bindRouterComponent: {
${bindPageComponentTypes.join('\n')}
} = (name: string, component: (props: any) => JSX.Element) => {
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
