import * as path from 'path'

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
