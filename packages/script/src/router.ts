import { TypeDeclaration } from 'types-as-schema'
import { generateRouterDeclaration } from '.'

const outPath = process.env.ROUTER_OUTPUT_PATH || process.env.OUTPUT_PATH || './static/router-declaration.ts'

export default (typeDeclarations: TypeDeclaration[]) => generateRouterDeclaration(typeDeclarations, outPath)
