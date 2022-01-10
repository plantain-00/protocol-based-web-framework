import type { Client, Pool, QueryResultRow } from 'pg'
import { RowFilterOptions, RowSelectOneOptions, RowSelectOptions, SqlRawFilter } from './db-declaration-lib'
import { isArray } from './utils'

/**
 * @public
 */
export class PostgresAccessor<TableName extends string> {
  constructor(
    private client: Client | Pool,
    private tableSchemas: Record<TableName, {
      fieldNames: string[]
      fieldTypes: string[]
      autoIncrementField?: string
      optionalFields: string[]
      uniqueFields: string[]
      indexFields: string[]
    }>) {
  }

  public createTable = async (tableName: TableName) => {
    const schema = this.tableSchemas[tableName]
    const fields = schema.fieldNames.map((f, i) => {
      const parts = [f]
      if (schema.autoIncrementField === f) {
        parts.push('SERIAL')
      }
      parts.push(schema.fieldTypes[i])
      if (!schema.optionalFields.includes(f)) {
        parts.push('NOT NULL')
      }
      if (schema.uniqueFields.includes(f)) {
        parts.push('UNIQUE')
      }
      return parts
    })
    await this.client.query(`CREATE TABLE IF NOT EXISTS ${tableName}(${fields.map((f) => f.join(' ')).join(', ')})`)

    for (const [fieldName, ...fieldTypeParts] of fields) {
      await this.client.query(`ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS ${fieldName} ${fieldTypeParts.join(' ')}`)
    }

    if (schema.indexFields.length > 0) {
      await this.client.query(`CREATE INDEX ${tableName}_${schema.indexFields.join('_')}_index ON ${tableName} (${schema.indexFields.join(', ')})`)
    }
  }

  public insertRow = async <T extends Record<string, unknown>>(
    tableName: TableName,
    value: T,
  ) => {
    const { values, fields } = this.getFieldsAndValues(tableName, value)
    const result = await this.client.query<{ id: number }>(`INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${new Array<unknown>(fields.length).fill(undefined).map((_, i) => `$${i + 1}`).join(', ')}) RETURNING id`, values)
    return result.rows[0].id
  }

  public updateRow = async<T extends Record<string, unknown>>(
    tableName: TableName,
    value?: T,
    options?: RowFilterOptions<T, SqlRawFilter>,
  ) => {
    const { values, fields } = this.getFieldsAndValues(tableName, value)
    const { sql, values: whereValues } = this.getWhereSql(tableName, fields.length, options)
    const result = await this.client.query<QueryResultRow>(`UPDATE ${tableName} SET ${fields.map((f, i) => `${f} = $${i + 1}`).join(', ')} ${sql}`, [...values, ...whereValues])
    return result.rowCount
  }

  public deleteRow = async<T>(
    tableName: TableName,
    options?: RowFilterOptions<T, SqlRawFilter>,
  ) => {
    const { sql, values } = this.getWhereSql(tableName, 0, options)
    await this.client.query(`DELETE FROM ${tableName} ${sql}`, values)
  }

  public selectRow = async<T extends Record<string, unknown>>(
    tableName: TableName,
    options?: RowSelectOptions<T, SqlRawFilter>
  ) => {
    const { sql, values } = this.getSelectSql(tableName, options)
    const result = await this.client.query<T>(sql, values)
    return result.rows.map(this.nullToUndefined)
  }

  public countRow = async<T>(
    tableName: TableName,
    options?: RowFilterOptions<T, SqlRawFilter>
  ) => {
    const { sql, values } = this.getWhereSql(tableName, 0, options)
    const result = await this.client.query<{ 'COUNT(1)': number }>(`SELECT COUNT(1) FROM ${tableName} ${sql}`, values)
    return result.rows[0]['COUNT(1)']
  }

  public getRow = async<T extends Record<string, unknown>>(
    tableName: TableName,
    options?: RowSelectOneOptions<T, SqlRawFilter>
  ) => {
    const { sql, values } = this.getSelectOneSql(tableName, options)
    const result = await this.client.query<T>(sql, values)
    return this.nullToUndefined(result.rows[0])
  }

  private getFieldsAndValues = <T extends Record<string, unknown>>(
    tableName: TableName,
    value?: T,
  ) => {
    const values: unknown[] = []
    const fields: string[] = []
    const allFields: string[] = this.tableSchemas[tableName].fieldNames
    if (value) {
      for (const [key, fieldValue] of Object.entries(value)) {
        if (!allFields.includes(key)) {
          continue
        }
        fields.push(key)
        values.push(fieldValue)
      }
    }
    return {
      fields,
      values,
    }
  }

  private getWhereSql = <T>(
    tableName: TableName,
    startIndex: number,
    options?: RowFilterOptions<T, SqlRawFilter>,
  ) => {
    const allFields: string[] = this.tableSchemas[tableName].fieldNames
    const values: unknown[] = []
    const filterValue: string[] = []
    if (options?.filter) {
      for (const [key, fieldValue] of Object.entries(options.filter)) {
        if (!allFields.includes(key) || fieldValue === undefined) {
          continue
        }
        if (isArray(fieldValue)) {
          filterValue.push(`${key} IN (${new Array<unknown>(fieldValue.length).fill(undefined).map((_, i) => `$${i + startIndex}`).join(', ')})`)
          startIndex += fieldValue.length
          values.push(...fieldValue)
        } else {
          filterValue.push(`${key} = $${startIndex + 1}`)
          startIndex++
          values.push(fieldValue)
        }
      }
    }
    if (options?.fuzzyFilter) {
      for (const [key, fieldValue] of Object.entries(options.fuzzyFilter)) {
        if (!allFields.includes(key) || fieldValue === undefined) {
          continue
        }
        filterValue.push(`${key} ILIKE '%' || $${startIndex + 1} || '%'`)
        startIndex++
        values.push(String(fieldValue))
      }
    }
    if (options?.rawFilter) {
      filterValue.push(options.rawFilter.sql)
      values.push(...options.rawFilter.value)
    }
    let sql = ''
    if (filterValue.length > 0) {
      sql += 'WHERE ' + filterValue.join(' AND ')
    }
    return {
      sql,
      values,
    }
  }

  private getSelectSql = <T extends Record<string, unknown>>(
    tableName: TableName,
    options?: RowSelectOptions<T, SqlRawFilter>
  ) => {
    const { sql, values } = this.getSelectOneSql(tableName, options)
    let limit = ''
    if (options?.pagination) {
      limit = `LIMIT ${options.pagination.take} OFFSET ${options.pagination.skip}`
    }
    return {
      sql: `${sql} ${limit}`,
      values,
    }
  }

  private getSelectOneSql = <T extends Record<string, unknown>>(
    tableName: TableName,
    options?: RowSelectOneOptions<T, SqlRawFilter>
  ) => {
    const { sql, values } = this.getWhereSql(tableName, 0, options)
    let orderBy = ''
    if (options?.sort && options.sort.length > 0) {
      orderBy = 'ORDER BY ' + options.sort.map((s) => `${s.field} ${s.type}`).join(', ')
    }
    const allFields: string[] = this.tableSchemas[tableName].fieldNames
    const fieldNames = allFields.filter((f) => (!options?.pickedFields || options.pickedFields.includes(f)) && !options?.ignoredFields?.includes(f)).join(', ')
    return {
      sql: `SELECT ${fieldNames} FROM ${tableName} ${sql} ${orderBy}`,
      values,
    }
  }

  private nullToUndefined = <T extends Record<string, unknown>>(row?: T) => {
    if (row) {
      for (const field of Object.keys(row)) {
        const value = row[field]
        if (value === null) {
          delete row[field]
        }
      }
    }
    return row
  }
}
