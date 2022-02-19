import { TypeDeclaration } from 'types-as-schema'
import { generateRestfulApiDeclaration } from '.'

const backendOutputPath = process.env.BACKEND_OUTPUT_PATH || './src/restful-api-declaration.ts'
const frontendOutputPath = process.env.FRONTEND_OUTPUT_PATH || './static/restful-api-declaration.ts'

export default (typeDeclarations: TypeDeclaration[]) => generateRestfulApiDeclaration(typeDeclarations, backendOutputPath, frontendOutputPath, process.env.IGNORED_FIELDS_NAME, process.env.PICKED_FIELDS_NAME)
