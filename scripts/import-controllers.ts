import { TypeDeclaration } from 'types-as-schema'
import { collectReference, getImports } from './util'

const outPath = process.env.IMPORT_CONTROLLER_OUTPUT_PATH || './dev/import-controllers.ts'

export default (typeDeclarations: TypeDeclaration[]): { path: string, content: string }[] => {
  const references = new Map<string, string[]>()
  for (const declaration of typeDeclarations) {
    if (declaration.kind === 'function' && declaration.position.file.endsWith('.controller.ts')) {
      collectReference(declaration.name, outPath, declaration.position.file, references)
    }
  }
  return [
    {
      path: outPath,
      content: getImports(references, true).join('\n') + '\n',
    },
  ]
}
