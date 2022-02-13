import { Member, TypeDeclaration } from 'types-as-schema'
import { collectReference, getReferencesImports } from './util'

const outPath = process.env.DB_OUTPUT_PATH || process.env.OUTPUT_PATH || './src/db-declaration.ts'
const backendDeclarationLibPath = '@protocol-based-web-framework/db'

export default (typeDeclarations: TypeDeclaration[]): { path: string, content: string }[] => {
  const references = new Map<string, string[]>()
  const schemas: {
    tableName: string
    typeName: string
    fields: Member[]
    complexFields: string[]
    autoIncrementField?: string
    optionalFields: string[]
    uniqueFields: string[]
    indexFields: string[]
  }[] = []
  for (const declaration of typeDeclarations) {
    if (declaration.kind === 'object' && declaration.entry) {
      const autoIncrementMember = declaration.members.find((m) => m.jsDocs?.some((d) => d.name === 'autoincrement'))
      collectReference(declaration.name, outPath, declaration.position.file, references)
      
      schemas.push({
        tableName: declaration.entry,
        typeName: declaration.name,
        fields: declaration.members,
        complexFields: declaration.members.filter((m) => m.type.kind !== 'string' && m.type.kind !== 'number' && m.type.kind !== 'boolean').map((m) => m.name),
        autoIncrementField: autoIncrementMember?.name,
        optionalFields: declaration.members.filter((m) => m.optional).map((m) => m.name),
        uniqueFields: declaration.members.filter((m) => m.unique).map((m) => m.name),
        indexFields: declaration.members.filter((m) => m.index).map((m) => m.name),
      })
    }
  }

  const content = `import { RowFilterOptions, RowSelectOneOptions, RowSelectOptions, SqlRawFilter, getKeys } from "${backendDeclarationLibPath}"
${getReferencesImports(references).join('\n')}

export interface GetRow<T = SqlRawFilter> {
${schemas.map((s) => `  <TIgnored extends keyof ${s.typeName} = never, TPicked extends keyof ${s.typeName} = keyof ${s.typeName}>(tableName: '${s.tableName}', options?: RowSelectOneOptions<${s.typeName}, T> & { ignoredFields?: TIgnored[], pickedFields?: TPicked[] }): Promise<Omit<Pick<${s.typeName}, TPicked>, TIgnored> | undefined>`).join('\n')}
}

export interface SelectRow<T = SqlRawFilter> {
${schemas.map((s) => `  <TIgnored extends keyof ${s.typeName} = never, TPicked extends keyof ${s.typeName} = keyof ${s.typeName}>(tableName: '${s.tableName}', options?: RowSelectOptions<${s.typeName}, T> & { ignoredFields?: TIgnored[], pickedFields?: TPicked[] }): Promise<Omit<Pick<${s.typeName}, TPicked>, TIgnored>[]>`).join('\n')}
}

export interface InsertRow<T = number> {
${schemas.map((s) => {
    const optionalRowIdField = s.autoIncrementField ?? (s.fields.some((f) => f.name === '_id') ? '_id' : undefined)
    const type = optionalRowIdField ? `Pick<Partial<${s.typeName}>, '${optionalRowIdField}'> & Omit<${s.typeName}, '${optionalRowIdField}'>` : s.typeName
    return `  (tableName: '${s.tableName}', value: ${type}): Promise<T>`
  }).join('\n')}
}

export interface UpdateRow<T = SqlRawFilter> {
${schemas.map((s) => `  (tableName: '${s.tableName}', value?: Partial<${s.typeName}>, options?: RowFilterOptions<${s.typeName}, T>): Promise<number>`).join('\n')}
}

export interface DeleteRow<T = SqlRawFilter> {
${schemas.map((s) => `  (tableName: '${s.tableName}', options?: RowFilterOptions<${s.typeName}, T>): Promise<void>`).join('\n')}
}

export interface CountRow<T = SqlRawFilter> {
${schemas.map((s) => `  (tableName: '${s.tableName}', options?: RowFilterOptions<${s.typeName}, T>): Promise<number>`).join('\n')}
}

export const tableSchemas = {
${schemas.map((s) => `  ${s.tableName}: {
    fieldNames: [${s.fields.map((f) => `'${f.name}'`).join(', ')}] as (keyof ${s.typeName})[],
    fieldTypes: [${s.fields.map((f) => `'${getFieldType(f)}'`).join(', ')}],
    complexFields: [${s.complexFields.map((f) => `'${f}'`).join(', ')}] as string[],
    autoIncrementField: ${s.autoIncrementField ? `'${s.autoIncrementField}'` : undefined} as string | undefined,
    optionalFields: [${s.optionalFields.map((f) => `'${f}'`).join(', ')}] as string[],
    uniqueFields: [${s.uniqueFields.map((f) => `'${f}'`).join(', ')}] as string[],
    indexFields: [${s.indexFields.map((f) => `'${f}'`).join(', ')}] as string[],
  },`).join('\n')}
}

export const tableNames = getKeys(tableSchemas)
`
  return [
    {
      path: outPath,
      content: content,
    },
  ]
}

function getFieldType({ type, jsDocs }: Member): string {
  if (type.kind === 'number') {
    const jsDoc = jsDocs?.find((d) => d.name === 'type')
    if (jsDoc?.comment && ['smallint', 'integer', 'bigint', 'decimal', 'numeric', 'real', 'double precision'].includes(jsDoc.comment)) {
      return jsDoc.comment
    }
    return 'real'
  }
  if (type.kind === 'string') {
    return 'text'
  }
  if (type.kind === 'boolean') {
    return 'boolean'
  }
  if (type.kind === 'reference') {
    if (type.referenceName === 'Date') {
      return 'timestamp with time zone'
    }
  }
  return 'jsonb'
}
