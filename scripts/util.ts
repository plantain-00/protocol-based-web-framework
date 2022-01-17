import * as path from 'path'

export function collectReference(
  typeName: string,
  outPath: string,
  file: string,
  references: Map<string, string[]>,
) {
  let relativePath = path.relative(path.dirname(outPath), file)
  if (!relativePath.startsWith('.')) {
    relativePath = './' + relativePath
  }
  let types = references.get(relativePath)
  if (!types) {
    types = []
    references.set(relativePath, types)
  }
  if (!types.includes(typeName)) {
    types.push(typeName)
  }
}

export function getReferencesImports(references: Map<string, string[]>) {
  const imports: string[] = []
  for (const [key, value] of references.entries()) {
    imports.push(`import { ${value.join(', ')} } from "${key.substring(0, key.length - path.extname(key).length)}"`)
  }
  return imports
}
