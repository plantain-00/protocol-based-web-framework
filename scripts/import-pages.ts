import { TypeDeclaration } from 'types-as-schema'
import { collectReference, getImports } from './util'

const outPath = process.env.IMPORT_PAGE_OUTPUT_PATH || './dev/import-pages.ts'

export default (typeDeclarations: TypeDeclaration[]): { path: string, content: string }[] => {
  const references = new Map<string, string[]>()
  for (const declaration of typeDeclarations) {
    if (declaration.kind === 'function' && declaration.position.file.endsWith('.page.tsx')) {
      collectReference(declaration.name, outPath, declaration.position.file, references)
    }
  }
  return [
    {
      path: outPath,
      content: getImports(references).join('\n') + '\n',
    },
  ]
}
