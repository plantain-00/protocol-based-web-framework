import { TypeDeclaration } from 'types-as-schema'
import { generateImportStoriesDeclaration } from '.'

const outPath = process.env.IMPORT_STORY_OUTPUT_PATH || './dev/import-stories.ts'

export default (typeDeclarations: TypeDeclaration[]) => generateImportStoriesDeclaration(typeDeclarations, outPath)
