import { Definition, FunctionParameter, generateTypescriptOfFunctionParameter, generateTypescriptOfType, getAllDefinitions, getJsonSchemaProperty, getReferencedDefinitions, getReferencesInType, Member, TypeDeclaration, getDeclarationParameters } from 'types-as-schema'

export default (typeDeclarations: TypeDeclaration[]): { path: string, content: string }[] => {
  const backendResult: string[] = []
  const frontendResult: string[] = []
  const getRequestApiUrlResult: string[] = []
  const references: string[] = []
  const requestJsonSchemas: Array<{ name: string, schema: string }> = []
  const responseJsonSchemas: Array<{ name: string, url: string, method: string, schema: string, omittedReferences: string[] }> = []
  const bindRestfulApiHandlerTypes: string[] = []
  const apiSchemas: string[] = []
  const definitions = getAllDefinitions({ declarations: typeDeclarations, looseMode: true })

  function getParam(type: typeof allTypes[number], parameter: FunctionParameter[], backend?: boolean) {
    const optional = parameter.every((q) => q.optional) ? '?' : ''
    return {
      optional: parameter.every((q) => q.optional),
      value: `${type}${optional}: { ${parameter.map((q) => {
        if (q.name === 'ignoredFields' && q.type.kind === 'array' && q.type.type.kind === 'reference') {
          return 'ignoredFields?: T[]'
        }
        if (backend && q.type.kind === 'file') {
          return `${q.name}${q.optional ? '?' : ''}: Readable`
        }
        return generateTypescriptOfFunctionParameter(q)
      }).join(', ')} }`
    }
  }

  for (const declaration of typeDeclarations) {
    if (declaration.kind === 'function' && declaration.method && declaration.path && declaration.tags && declaration.tags.length > 0) {
      // register
      let path = declaration.path
      const declarationParameters = getDeclarationParameters(declaration, typeDeclarations)
      for (const parameter of declarationParameters) {
        if (parameter.in === 'path') {
          path = path.split(`{${parameter.name}}`).join(`:${parameter.name}`)
        }
      }
      const interfaceName = declaration.name[0].toUpperCase() + declaration.name.substring(1)
      bindRestfulApiHandlerTypes.push(`  (name: '${interfaceName}', req: ${interfaceName}): void`)
      apiSchemas.push(`  {
    name: '${interfaceName}',
    method: '${declaration.method}' as const,
    url: '${path}',
    tags: [${declaration.tags.map((t) => JSON.stringify(t)).join(', ')}],
    validate: ${declaration.name}Validate,
    handler: undefined as ((req: unknown) => Promise<{} | Readable>) | undefined,
  },`)

      // json schema
      const requestMergedDefinitions: { [name: string]: Definition } = {}
      const requestReferenceNames: string[] = []
      for (const parameter of declarationParameters) {
        requestReferenceNames.push(...getReferencesInType(parameter.type).map((r) => r.name))
      }
      for (const referenceName of requestReferenceNames) {
        const referencedName = getReferencedDefinitions(referenceName, definitions, [])
        Object.assign(requestMergedDefinitions, referencedName)
      }

      const responseMergedDefinitions: { [name: string]: Definition } = {}
      const responseReferenceNames = getReferencesInType(declaration.type).map((r) => r.name)
      for (const referenceName of responseReferenceNames) {
        const referencedName = getReferencedDefinitions(referenceName, definitions, [])
        Object.assign(responseMergedDefinitions, referencedName)
      }

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
          definitions: requestMergedDefinitions
        }, null, 2)
      })
      const responseJsonSchema = {
        name: declaration.name,
        method: declaration.method,
        url: declaration.path,
        omittedReferences: [] as string[],
        schema: JSON.stringify({
          ...getJsonSchemaProperty(
            declaration.type,
            { declarations: typeDeclarations, looseMode: true }
          ),
          definitions: responseMergedDefinitions
        }, null, 2)
      }
      responseJsonSchemas.push(responseJsonSchema)

      // import reference
      references.push(...getReferencesInType(declaration.type).map((r) => r.name))
      for (const parameter of declarationParameters) {
        references.push(...getReferencesInType(parameter.type).map((r) => r.name))
      }

      // backend / frontend types
      const backendParams: { optional: boolean, value: string }[] = []
      const frontendParams: { optional: boolean, value: string }[] = []
      const frontendPathParams: { optional: boolean, value: string }[] = []
      const getRequestApiUrlParam: { optional: boolean, value: string }[] = []
      const getRequestApiUrlPathParam: { optional: boolean, value: string }[] = []
      let frontendPath = declaration.path
      for (const type of allTypes) {
        const parameter = declarationParameters.filter((d) => d.in === type)
        if (parameter.length > 0) {
          if (type === 'query') {
            getRequestApiUrlParam.push(getParam(type, parameter))
          } else if (type === 'path') {
            getRequestApiUrlPathParam.push(getParam(type, parameter))
          }
          if (type === 'query' || type === 'body') {
            frontendParams.push(getParam(type, parameter))
          } else if (type === 'path') {
            frontendPathParams.push(getParam(type, parameter))
          }
          parameter.forEach((q) => {
            if (q.type.default !== undefined) {
              q.optional = false
            }
            if (type === 'path') {
              frontendPath = frontendPath.split('{id}').join(`\${${q.type.kind}}`)
            }
          })
          backendParams.push(getParam(type, parameter, true))
        }
      }
      const frontendParameters = [
        `method: '${declaration.method.toUpperCase()}'`,
        `url: \`${frontendPath}\``,
      ]
      const frontendParameters2: string[] = []
      if (frontendPathParams.length > 0) {
        frontendParameters2.push(
          `method: '${declaration.method.toUpperCase()}'`,
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
      const getRequestApiUrlParameters = [
        `url: \`${frontendPath}\``,
      ]
      const getRequestApiUrlParameters2: string[] = []
      if (getRequestApiUrlPathParam.length > 0) {
        getRequestApiUrlParameters2.push(
          `url: '${declaration.path}'`,
        )
      }
      if (getRequestApiUrlParam.length > 0) {
        const optional = getRequestApiUrlParam.every((q) => q.optional) ? '?' : ''
        getRequestApiUrlParameters.push(`args${optional}: { ${getRequestApiUrlParam.map((p) => p.value).join(', ')} }`)
      }
      if (getRequestApiUrlPathParam.length > 0) {
        const optional = getRequestApiUrlParam.every((q) => q.optional) && getRequestApiUrlPathParam.every((q) => q.optional) ? '?' : ''
        getRequestApiUrlParameters2.push(`args${optional}: { ${[...getRequestApiUrlPathParam, ...getRequestApiUrlParam].map((p) => p.value).join(', ')} }`)
      }
      const backendParameters: string[] = []
      if (backendParams.length > 0) {
        const optional = backendParams.every((q) => q.optional) ? '?' : ''
        backendParameters.push(`req${optional}: { ${backendParams.map((p) => p.value).join(', ')} }`)
      }

      let returnType: string
      let frontendReturnType: string | undefined
      const omittedReferences = new Set<string>()
      if (declaration.type.kind === 'file') {
        returnType = 'Readable'
        frontendReturnType = 'Blob'
      } else {
        returnType = generateTypescriptOfType(declaration.type, (child) => {
          if (child.kind === 'reference') {
            omittedReferences.add(child.name)
            return `Omit<${child.name}, T>`
          }
          return undefined
        })
      }
      responseJsonSchema.omittedReferences = Array.from(omittedReferences)

      let ignorableField = ''
      for (const p of declarationParameters) {
        if (p.name === 'ignoredFields' && p.type.kind === 'array' && p.type.type.kind === 'reference') {
          ignorableField = p.type.type.name
        }
      }
      if (ignorableField) {
        frontendResult.push(`  <T extends ${ignorableField} = never>(${frontendParameters.join(', ')}): Promise<${frontendReturnType || returnType}>`)
        if (frontendParameters2.length > 0) {
          frontendResult.push(`  <T extends ${ignorableField} = never>(${frontendParameters2.join(', ')}): Promise<${frontendReturnType || returnType}>`)
        }
        getRequestApiUrlResult.push(`  <T extends ${ignorableField} = never>(${getRequestApiUrlParameters.join(', ')}): string`)
        if (getRequestApiUrlParameters2.length > 0) {
          getRequestApiUrlResult.push(`  <T extends ${ignorableField} = never>(${getRequestApiUrlParameters2.join(', ')}): string`)
        }
        backendResult.push(`export type ${interfaceName} = <T extends ${ignorableField} = never>(${backendParameters.join(', ')}) => Promise<${returnType}>`)
      } else {
        frontendResult.push(`  (${frontendParameters.join(', ')}): Promise<${frontendReturnType || returnType}>`)
        if (frontendParameters2.length > 0) {
          frontendResult.push(`  (${frontendParameters2.join(', ')}): Promise<${frontendReturnType || returnType}>`)
        }
        getRequestApiUrlResult.push(`  (${getRequestApiUrlParameters.join(', ')}): string`)
        if (getRequestApiUrlParameters2.length > 0) {
          getRequestApiUrlResult.push(`  (${getRequestApiUrlParameters2.join(', ')}): string`)
        }
        backendResult.push(`export type ${interfaceName} = (${backendParameters.join(', ')}) => Promise<${returnType}>`)
      }
    }
  }
  const backendContent = `/* eslint-disable */

import type { Readable } from 'stream'
import { ajvBackend } from '${process.env.BACKEND_DECLARATION_LIB_PATH || 'protocol-based-web-framework'}'
import { ${Array.from(new Set(references)).join(', ')} } from './restful-api-schema'

${backendResult.join('\n')}

${requestJsonSchemas.map((s) => `const ${s.name}Validate = ajvBackend.compile(${s.schema})`).join('\n')}

export const apiSchemas = [
${apiSchemas.join('\n')}
]

export const bindRestfulApiHandler: {
${bindRestfulApiHandlerTypes.join('\n')}
} = (name: string, handler: (input: any) => Promise<{} | Readable>) => {
  const schema = apiSchemas.find((s) => s.name === name)
  if (schema) {
    schema.handler = handler
  }
}
`
  const frontendContent = `import { ${Array.from(new Set(references)).join(', ')} } from '${process.env.RESTFUL_API_SCHEMA_PATH || '../src/restful-api-schema'}'
import { ajvFrontend } from '${process.env.FRONTEND_DECLARATION_LIB_PATH || 'protocol-based-web-framework'}'

export type RequestRestfulAPI = {
${frontendResult.join('\n')}
}

export type GetRequestApiUrl = {
${getRequestApiUrlResult.join('\n')}
}

${responseJsonSchemas.map((s) => `const ${s.name}JsonSchema = ${s.schema}`).join('\n')}

export const validations = [
${responseJsonSchemas.map((s) => `  {
    url: '${s.url}',
    method: '${s.method.toUpperCase()}',
    schema: ${s.name}JsonSchema,
    omittedReferences: [${s.omittedReferences.map((m) => `'${m}'`).join(',')}],
    validate: ajvFrontend.compile(${s.name}JsonSchema),
  },`).join('\n')}
]
`
  return [
    {
      path: process.env.BACKEND_OUTPUT_PATH || './src/restful-api-declaration.ts',
      content: backendContent,
    },
    {
      path: process.env.FRONTEND_OUTPUT_PATH || './static/restful-api-declaration.ts',
      content: frontendContent,
    },
  ]
}

const allTypes = ['path', 'query', 'body', 'cookie'] as const
