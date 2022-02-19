import { TypeDeclaration } from 'types-as-schema'
import { generateImportFunctionsDeclaration } from '.'

const outPath = process.env.IMPORT_CONTROLLER_OUTPUT_PATH || './dev/import-controllers.ts'

export default (typeDeclarations: TypeDeclaration[]) => generateImportFunctionsDeclaration(typeDeclarations, outPath, (file) => file.endsWith('.controller.ts'), true)
