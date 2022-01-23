import { TypeDeclaration } from 'types-as-schema'
import { getRelativePath, getImportPath } from './util'

const outPath = process.env.IMPORT_STORY_OUTPUT_PATH || './dev/import-stories.ts'

export default (typeDeclarations: TypeDeclaration[]): { path: string, content: string }[] => {
  const references: string[] = []
  const stories: string[] = []
  for (const declaration of typeDeclarations) {
    if (declaration.kind === 'function' && declaration.position.file.endsWith('.story.tsx')) {
      const importPath = getImportPath(getRelativePath(outPath, declaration.position.file))
      let path = importPath
      while (path.startsWith('.') || path.startsWith('/')) {
        path = path.substring(1)
      }
      const componentName = path.split(/\.|\//).map((f) => f[0].toUpperCase() + f.substring(1)).join('')
      references.push(`import ${componentName} from '${importPath}'`)
      stories.push(`  {
    path: '${path}',
    Component: ${componentName},
    code: \`() => ${declaration.body}\`,`)
    }
  }
  const content = `${references.join('\n')}

export const stories = [
${stories.join('\n')}
  },
]
`
  return [
    {
      path: outPath,
      content,
    },
  ]
}
