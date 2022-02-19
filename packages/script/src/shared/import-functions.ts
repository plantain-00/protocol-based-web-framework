import { TypeDeclaration } from 'types-as-schema'
import { collectReference, getImports } from './util'

export function generateImportFunctionsDeclaration(
  typeDeclarations: TypeDeclaration[],
  outPath: string,
  fileFilter: (file: string) => boolean,
  withDotJs?: boolean,
) {
  const references = new Map<string, string[]>()
  for (const declaration of typeDeclarations) {
    if (declaration.kind === 'function' && fileFilter(declaration.position.file)) {
      collectReference(declaration.name, outPath, declaration.position.file, references)
    }
  }
  return [
    {
      path: outPath,
      content: getImports(references, withDotJs).join('\n') + '\n',
    },
  ]
}
