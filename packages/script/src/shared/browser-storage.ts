import { TypeDeclaration, generateTypescriptOfType, Type, getJsonSchemaProperty, Definition, getReferencesInType, getReferencedDefinitions, getAllDefinitions } from 'types-as-schema'
import { collectReference, getReferencesImports } from './util'

export function generateBrowserStorageDeclaration(typeDeclarations: TypeDeclaration[], outPath: string, marker: string) {
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
      for (const referenceName of getReferencesInType(type).map((r) => r.referenceName)) {
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
