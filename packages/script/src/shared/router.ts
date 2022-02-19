import { FunctionParameter, generateTypescriptOfFunctionParameter, TypeDeclaration, getDeclarationParameters, getJsonSchemaProperty, Member } from 'types-as-schema'
import { pathToRegexp, Key } from 'path-to-regexp'
import { collectReference, getReferencesImports } from './util'

export function generateRouterDeclaration(typeDeclarations: TypeDeclaration[], outPath: string) {
  const getPageUrlResult: string[] = []
  const routers: string[] = []
  const bindPageComponentTypes: string[] = []
  const props: string[] = []
  const references = new Map<string, string[]>()

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
    let declarationPath: string | undefined
    let interfaceName = ''
    let propsName: string | undefined
    let declarationParameters: FunctionParameter[] = []
    if (declaration.kind === 'function' && declaration.path && !declaration.method) {
      declarationPath = declaration.path
      interfaceName = declaration.name[0].toUpperCase() + declaration.name.substring(1)
      propsName = `${interfaceName}Props`
      declarationParameters = getDeclarationParameters(declaration, typeDeclarations)
    } else if (declaration.kind === 'object') {
      const path = declaration.jsDocs?.find((d) => d.name === 'route')?.comment
      if (path) {
        declarationPath = path
        propsName = declaration.name
        collectReference(declaration.name, outPath, declaration.position.file, references)
        declarationParameters = getDeclarationParameters({ parameters: declaration.members }, typeDeclarations)
      }
    }
    if (declarationPath && propsName) {
      // register
      let path = declarationPath
      for (const parameter of declarationParameters) {
        if (parameter.in === 'path') {
          if (!path.includes(`{${parameter.name}}`)) {
            throw new Error(`path parameter(${parameter.name}) is not in the path declaration(${declarationPath})`)
          }
          path = path.split(`{${parameter.name}}`).join(`:${parameter.name}`)
        }
      }
      if (path.includes('{') && path.includes('}')) {
        throw new Error(`(${path.substring(path.indexOf('{') + 1, path.indexOf('}'))}) is not declared in the path parameter declaration(${declarationPath})`)
      }

      let regexp = declarationPath
      const pathParameters = declarationParameters.filter((p) => p.in === 'path')
      pathParameters.forEach((p) => {
        regexp = regexp.split(`{${p.name}}`).join(`:${p.name}`)
      })
      const keys: Key[] = []
      const regexpString = pathParameters.length > 0 ? pathToRegexp(regexp, keys) : undefined

      // frontend types
      const propsParams: { optional: boolean, value: string }[] = []
      const getPageUrlParam: { optional: boolean, value: string }[] = []
      const getPageUrlPathParam: { optional: boolean, value: string }[] = []
      let frontendPath = declarationPath
      for (const type of allTypes) {
        const parameter = declarationParameters.filter((d) => d.in === type)
        if (parameter.length > 0) {
          parameter.forEach((q) => {
            if (q.type.default !== undefined) {
              q.optional = true
            }
          })
          if (type === 'query') {
            getPageUrlParam.push(getParam(type, parameter))
          } else {
            getPageUrlPathParam.push(getParam(type, parameter))
          }
          parameter.forEach((q) => {
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
      
      const schema = JSON.stringify({
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
      routers.push(`  {
    name: '${interfaceName}',
    path: '${path}',
    regexp: ${regexpString ? regexpString : 'undefined'},
    keys: [${keys.map((f) => `'${f.name}'`).join(', ')}],
    validate: ajv.compile(${schema}),
  },`)

      const getPageUrlParameters = [
        `url: \`${frontendPath}\``,
      ]
      const getPageUrlParameters2: string[] = []
      if (getPageUrlPathParam.length > 0) {
        getPageUrlParameters2.push(
          `url: '${declarationPath}'`,
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
        bindPageComponentTypes.push(`  (path: '${path}', component: (props: ${propsName}) => JSX.Element): void`)
        if (interfaceName) {
          bindPageComponentTypes.push(`  (name: '${interfaceName}', component: (props: ${propsName}) => JSX.Element): void`)
        }
      } else {
        bindPageComponentTypes.push(`  (path: '${path}', component: () => JSX.Element): void`)
        if (interfaceName) {
          bindPageComponentTypes.push(`  (name: '${interfaceName}', component: () => JSX.Element): void`)
        }
      }

      if (propsParams.length > 0 && interfaceName) {
        props.push(`export type ${propsName} = { ${propsParams.map((p) => p.value).join(', ')} }`)
      }

      getPageUrlResult.push(`  (${getPageUrlParameters.join(', ')}): string`)
      if (getPageUrlParameters2.length > 0) {
        getPageUrlResult.push(`  (${getPageUrlParameters2.join(', ')}): string`)
      }
    }
  }

  let content = `import { ajv, Route } from '@protocol-based-web-framework/router'
${getReferencesImports(references).join('\n')}

export interface GetPageUrl {
${getPageUrlResult.join('\n')}
}

export const routes: Route[] = [
${routers.join('\n')}
]

export const bindRouterComponent: {
${bindPageComponentTypes.join('\n')}
} = (path: string, component: (props: any) => JSX.Element) => {
  const schema = routes.find((s) => s.path === path || s.name === path)
  if (schema) {
    schema.Component = component
  }
}
`
if (props.length > 0) {
  content += `
${props.join('\n')}
`
}
  return [
    {
      path: outPath,
      content,
    },
  ]
}

const allTypes = ['path', 'query'] as const
