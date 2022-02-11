import * as path from 'path'
import { TypeDeclaration, generateTypescriptOfType, Type, getJsonSchemaProperty, Definition, getReferencesInType, getReferencedDefinitions, getAllDefinitions } from 'types-as-schema'

export function collectReference(
  typeName: string,
  outPath: string,
  file: string,
  references: Map<string, string[]>,
) {
  const relativePath = getRelativePath(outPath, file)
  let types = references.get(relativePath)
  if (!types) {
    types = []
    references.set(relativePath, types)
  }
  if (!types.includes(typeName)) {
    types.push(typeName)
  }
}

export function getRelativePath(outPath: string, file: string) {
  let relativePath = path.relative(path.dirname(outPath), file)
  if (!relativePath.startsWith('.')) {
    relativePath = './' + relativePath
  }
  return relativePath
}

export function getReferencesImports(references: Map<string, string[]>) {
  const imports: string[] = []
  for (const [key, value] of references.entries()) {
    imports.push(`import { ${value.join(', ')} } from "${getImportPath(key)}"`)
  }
  return imports
}

export function getImports(references: Map<string, string[]>, withDotJs?: boolean) {
  const imports: string[] = []
  for (const key of references.keys()) {
    imports.push(`import "${getImportPath(key, withDotJs)}"`)
  }
  return imports
}

export function getImportPath(key: string, withDotJs?: boolean) {
  return key.substring(0, key.length - path.extname(key).length) + (withDotJs ? '.js' : '')
}

export function getBrowserStorageScript(outPath: string, marker: string) {
  return (typeDeclarations: TypeDeclaration[]): { path: string, content: string }[] => {
    const references = new Map<string, string[]>()
    const schemas: { key: string, value: string, name: string, schema: string }[] = []
    const definitions = getAllDefinitions({ declarations: typeDeclarations, looseMode: true })
    for (const declaration of typeDeclarations) {
      if (declaration.kind === 'function') {
        continue
      }
      const jsDoc = declaration.jsDocs?.find((s) => s.name === marker)
      if (jsDoc && declaration.kind !== 'unknown') {
        const type: Type = declaration.kind === 'enum' ? { ...declaration, enums: declaration.members.map((m) => m.value) } : declaration

        // json schema
        const mergedDefinitions: { [name: string]: Definition } = {}
        for (const referenceName of getReferencesInType(type).map((r) => r.name)) {
          const referencedName = getReferencedDefinitions(referenceName, definitions, [])
          Object.assign(mergedDefinitions, referencedName)
          const declaration = typeDeclarations.find((d) => d.name === referenceName)
          if (declaration) {
            collectReference(referenceName, outPath, declaration.position.file, references)
          }
        }

        schemas.push({
          name: declaration.name,
          key: JSON.stringify(jsDoc.comment || declaration.name),
          value: generateTypescriptOfType(type),
          schema: JSON.stringify({
            ...getJsonSchemaProperty(type, { declarations: typeDeclarations, looseMode: true }),
            definitions: mergedDefinitions
          }, null, 2),
        })
      }
    }

    const content = `import { ajv } from '@protocol-based-web-framework/browser-storage'
${getReferencesImports(references).join('\n')}

export interface GetItem {
${schemas.map((s) => `  (key: ${s.key}): ${s.value}`).join('\n')}
}

export interface SetItem {
${schemas.map((s) => `  (key: ${s.key}, value: ${s.value}): void`).join('\n')}
}

export interface RemoveItem {
${schemas.map((s) => `  (key: ${s.key}): void`).join('\n')}
}

${schemas.map((s) => `const ${s.name}Validate = ajv.compile(${s.schema})`).join('\n')}

export const validations = [
${schemas.map((s) => `  {
    key: ${s.key},
    validate: ${s.name}Validate,
  },`).join('\n')}
]
`
    return [
      {
        path: outPath,
        content: content,
      },
    ]
  }
}
