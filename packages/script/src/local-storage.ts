import { TypeDeclaration } from 'types-as-schema'
import { generateBrowserStorageDeclaration } from '.'

const outPath = process.env.LOCAL_STORAGE_OUTPUT_PATH || './src/local-storage-declaration.ts'

export default (typeDeclarations: TypeDeclaration[]) => generateBrowserStorageDeclaration(typeDeclarations, outPath, 'localStorage')
