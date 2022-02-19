import { TypeDeclaration } from 'types-as-schema'
import { generateImportFunctionsDeclaration } from '.'

const outPath = process.env.IMPORT_PAGE_OUTPUT_PATH || './dev/import-pages.ts'

export default (typeDeclarations: TypeDeclaration[]) => generateImportFunctionsDeclaration(typeDeclarations, outPath, (file) => file.endsWith('.page.tsx'))
