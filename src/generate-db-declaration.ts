import type { TypeDeclaration } from 'types-as-schema'

export default (typeDeclarations: TypeDeclaration[]): { path: string, content: string }[] => {
  const schemas: { tableName: string, typeName: string, fields: string[], complexFields: string[] }[] = []
  for (const declaration of typeDeclarations) {
    if (declaration.kind === 'object' && declaration.entry) {
      schemas.push({
        tableName: declaration.entry,
        typeName: declaration.name,
        fields: declaration.members.map((m) => m.name),
        complexFields: declaration.members.filter((m) => m.type.kind !== 'string' && m.type.kind !== 'number' && m.type.kind !== 'boolean').map((m) => m.name),
      })
    }
  }

  const content = `import { RowFilterOptions, RowSelectOneOptions, RowSelectOptions, getKeys, SqlRawFilter } from "${process.env.DB_DECLARATION_LIB_PATH || 'protocol-based-web-framework'}"
import { ${schemas.map((s) => s.typeName).join(', ')} } from "${process.env.DB_SCHEMA_PATH || './db-schema'}"

export type GetRow<T = SqlRawFilter> = {
${schemas.map((s) => `  <TIgnored extends keyof ${s.typeName} = never, TPicked extends keyof ${s.typeName} = keyof ${s.typeName}>(tableName: '${s.tableName}', options?: RowSelectOneOptions<${s.typeName}, T> & { ignoredFields?: TIgnored[], pickedFields?: TPicked[] }): Promise<Omit<Pick<${s.typeName}, TPicked>, TIgnored> | undefined>`).join('\n')}
}

export type SelectRow<T = SqlRawFilter> = {
${schemas.map((s) => `  <TIgnored extends keyof ${s.typeName} = never, TPicked extends keyof ${s.typeName} = keyof ${s.typeName}>(tableName: '${s.tableName}', options?: RowSelectOptions<${s.typeName}, T> & { ignoredFields?: TIgnored[], pickedFields?: TPicked[] }): Promise<Omit<Pick<${s.typeName}, TPicked>, TIgnored>[]>`).join('\n')}
}

export type InsertRow<T = number> = {
${schemas.map((s) => `  (tableName: '${s.tableName}', value: ${s.typeName}): Promise<T>`).join('\n')}
}

export type UpdateRow<T = SqlRawFilter> = {
${schemas.map((s) => `  (tableName: '${s.tableName}', value?: Partial<${s.typeName}>, options?: RowFilterOptions<${s.typeName}, T>): Promise<number>`).join('\n')}
}

export type DeleteRow<T = SqlRawFilter> = {
${schemas.map((s) => `  (tableName: '${s.tableName}', options?: RowFilterOptions<${s.typeName}, T>): Promise<void>`).join('\n')}
}

export type CountRow<T = SqlRawFilter> = {
${schemas.map((s) => `  (tableName: '${s.tableName}', options?: RowFilterOptions<${s.typeName}, T>): Promise<number>`).join('\n')}
}

export const tableSchemas = {
${schemas.map((s) => `  ${s.tableName}: {
    fieldNames: [${s.fields.map((f) => `'${f}'`).join(', ')}] as (keyof ${s.typeName})[],
    complexFields: [${s.complexFields.map((f) => `'${f}'`).join(', ')}] as string[],
  },`).join('\n')}
}

export const tableNames = getKeys(tableSchemas)
`
  return [
    {
      path: process.env.OUTPUT_PATH || './src/db-declaration.ts',
      content: content,
    },
  ]
}
