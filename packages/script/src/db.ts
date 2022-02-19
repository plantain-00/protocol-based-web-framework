import { TypeDeclaration } from 'types-as-schema'
import { generateDbDeclaration } from '.'

const outPath = process.env.DB_OUTPUT_PATH || process.env.OUTPUT_PATH || './src/db-declaration.ts'

export default (typeDeclarations: TypeDeclaration[]) => generateDbDeclaration(typeDeclarations, outPath)
