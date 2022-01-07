import type { Client, Pool, QueryResultRow } from 'pg'
import { RowFilterOptions, RowSelectOneOptions, RowSelectOptions, SqlRawFilter } from './db-declaration-lib'

/**
 * @public
 */
export class PostgresAccessor<TableName extends string> {
  constructor(private client: Client | Pool, private tableSchemas: Record<TableName, { fieldNames: string[], fieldTypes: string[] }>) {
  }

  public createTable = async (tableName: TableName) => {
    const fieldNames = this.tableSchemas[tableName].fieldNames
    const fieldTypes = this.tableSchemas[tableName].fieldTypes
    await this.client.query(`CREATE TABLE IF NOT EXISTS ${tableName}(${fieldNames.map((f, i) => `${f} ${fieldTypes[i]}`).join(', ')})`)
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
    return result.rows
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
    return result.rows[0]
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
}

const isArray = (arg: unknown): arg is unknown[] => Array.isArray(arg)
