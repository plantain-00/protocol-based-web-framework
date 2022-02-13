import { FunctionDeclaration, generateTypescriptOfType, Member, Type, TypeDeclaration, TypeParameter } from 'types-as-schema'
import { getRelativePath, getImportPath } from './util'

const outPath = process.env.IMPORT_STORY_OUTPUT_PATH || './dev/import-stories.ts'

export default (typeDeclarations: TypeDeclaration[]): { path: string, content: string }[] => {
  const references: string[] = []
  const stories: string[] = []
  const storyInfos: StoryInfo[] = []
  for (const declaration of typeDeclarations) {
    if (
      declaration.kind === 'function' &&
      (declaration.position.file.endsWith('.story.tsx') || declaration.position.file.endsWith('.stories.tsx')) &&
      declaration.parameters.length === 0 &&
      (declaration.name === '' || declaration.modifiers?.some((m) => m === 'export'))
    ) {
      let members: unknown[] = []
      const jsDoc = declaration?.jsDocs?.find((d) => d.name === 'component')
      const componentName = jsDoc?.comment
      let componentBody: string | undefined
      if (componentName) {
        const component = typeDeclarations.find((d) => d.name === componentName)
        let propsType: Type | undefined
        let typeParameters: TypeParameter[] | undefined
        if (component?.kind === 'function' && component.parameters.length > 0) {
          propsType = component.parameters[0].type
          componentBody = component.body
          if (propsType.kind === undefined && component.typeArguments && component.typeArguments?.length > 0) {
            propsType = component.typeArguments[0]
          }
          if (component.typeParameters) {
            typeParameters = component.typeParameters
          }
        } else if (component?.kind === 'unknown' && component.typeArguments && component.typeArguments.length === 1) {
          propsType = component.typeArguments[0]
        }
        if (propsType) {
          members = getPropsMembers(propsType, typeDeclarations).map((m) => ({
            name: m.name,
            type: generateTypescriptOfType(m.type, (t) => {
              if (t.kind === 'reference') {
                const typeParameter = typeParameters?.find((p) => p.name === t.referenceName)
                if (typeParameter?.constraint) {
                  return `(${t.referenceName} extends ${generateTypescriptOfType(typeParameter.constraint)})`
                }
              }
              return
            }),
            optional: m.optional ?? false,
            description: m.jsDocs?.find((d) => d.name === '')?.comment ?? '',
          }))
        }
      }
      const importPath = getImportPath(getRelativePath(outPath, declaration.position.file))
      let path = importPath
      while (path.startsWith('.') || path.startsWith('/')) {
        path = path.substring(1)
      }
      const defaultComponentName = path.split(/\.|\/|-/).map((f) => f[0].toUpperCase() + f.substring(1)).join('')
      references.push(`import ${declaration.name ? `{ ${declaration.name} }` : defaultComponentName} from '${importPath}'`)
      storyInfos.push({
        path,
        declaration,
        defaultComponentName,
        members,
        componentName,
        componentBody,
      })
    }
  }
  setParentComponentName(storyInfos)
  for (const { path, declaration, defaultComponentName, members, componentName, parentComponentName } of storyInfos) {
    stories.push(`  {
    path: '${path}',
    name: '${declaration.name}',
    Component: ${declaration.name || defaultComponentName},
    code: '() => ' + ${JSON.stringify(declaration.body)},
    props: ${JSON.stringify(members, null, 2).split('\n').map((m, i) => i === 0 ? m : '    ' + m).join('\n')},
    componentName: '${componentName ?? ''}',
    parentComponentName: '${parentComponentName ?? ''}',
  },`)
  }
  const content = `${references.join('\n')}

export const stories = [
${stories.join('\n')}
]
`
  return [
    {
      path: outPath,
      content,
    },
  ]
}

function getPropsMembers(type: Type, typeDeclarations: TypeDeclaration[]): Member[] {
  if (type.kind === 'object') {
    return type.members
  }
  if (type.kind === 'reference') {
    const referenceType = typeDeclarations.find((d) => d.name === type.referenceName)
    if (referenceType && referenceType.kind === 'object') {
      return referenceType.members
    }
  }
  if (type.kind === 'union') {
    return type.members.map((m) => getPropsMembers(m, typeDeclarations)).flat()
  }
  return []
}

interface StoryInfo {
  path: string
  declaration: FunctionDeclaration
  defaultComponentName: string
  members: unknown[]
  componentName?: string
  componentBody?: string
  parentComponentName?: string
}

function setParentComponentName(storyInfos: StoryInfo[]) {
  for (const info of storyInfos) {
    if (info.componentName && info.componentBody) {
      for (const item of storyInfos) {
        if (item !== info && item.componentName && item.componentBody) {
          if (item.componentBody.includes(info.componentName)) {
            info.parentComponentName = item.componentName
          } else {
            info.parentComponentName = undefined
            break
          }
        }
      }
    }
   }
}
