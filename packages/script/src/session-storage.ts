import { TypeDeclaration } from 'types-as-schema'
import { generateBrowserStorageDeclaration } from '.'

const outPath = process.env.SESSION_STORAGE_OUTPUT_PATH || './src/session-storage-declaration.ts'

export default (typeDeclarations: TypeDeclaration[]) => generateBrowserStorageDeclaration(typeDeclarations, outPath, 'sessionStorage')
