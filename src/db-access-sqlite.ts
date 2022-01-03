import type { Database } from 'sqlite3'
import { RowFilterOptions, RowSelectOneOptions, RowSelectOptions } from './db-declaration-lib'

/**
 * @public
 */
export class SqliteAccessor<TableName extends string> {
  constructor(private db: Database, private tableSchemas: Record<TableName, { fieldNames: string[], complexFields: string[] }>) {
  }

  public async createTable(tableName: TableName) {
    const fieldNames = this.tableSchemas[tableName].fieldNames
    await this.run(`CREATE TABLE IF NOT EXISTS ${tableName}(${fieldNames.join(', ')})`)
  }

  public async insertRow<T extends Record<string, unknown>>(
    tableName: TableName,
    value: T,
  ) {
    const { values, fields } = this.getFieldsAndValues(tableName, value)
    await this.run(`INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${new Array(fields.length).fill('?').join(', ')})`, ...values)
    return value
  }

  public async updateRow<T extends Record<string, unknown>>(
    tableName: TableName,
    value?: T,
    options?: RowFilterOptions<T>,
  ) {
    const { values, fields } = this.getFieldsAndValues(tableName, value)
    const { sql, values: whereValues } = this.getWhereSql(tableName, options)
    await this.run(`UPDATE ${tableName} SET ${fields.map((f) => `${f} = ?`).join(', ')} ${sql}`, ...values, ...whereValues)
  }

  public async deleteRow<T>(
    tableName: TableName,
    options?: RowFilterOptions<T>,
  ) {
    const { sql, values } = this.getWhereSql(tableName, options)
    await this.run(`DELETE FROM ${tableName} ${sql}`, ...values)
  }


  public async selectRow<T extends Record<string, unknown>>(
    tableName: TableName,
    options?: RowSelectOptions<T>
  ) {
    const { sql, values } = this.getSelectSql(tableName, options)
    return this.all<T>(sql, this.tableSchemas[tableName].complexFields, ...values)
  }

  public async countRow<T>(
    tableName: TableName,
    options?: RowFilterOptions<T>
  ) {
    const { sql, values } = this.getWhereSql(tableName, options)
    const result = await this.all<{ 'COUNT(1)': number }>(`SELECT COUNT(1) FROM ${tableName} ${sql}`, [], ...values)
    return result[0]['COUNT(1)']
  }

  public async getRow<T extends Record<string, unknown>>(
    tableName: TableName,
    options?: RowSelectOneOptions<T>
  ) {
    const { sql, values } = this.getSelectSql(tableName, options)
    return this.get<T>(sql, this.tableSchemas[tableName].complexFields, ...values)
  }

  private getFieldsAndValues<T extends Record<string, unknown>>(
    tableName: TableName,
    value?: T,
  ) {
    const values: unknown[] = []
    const fields: string[] = []
    const allFields: string[] = this.tableSchemas[tableName].fieldNames
    if (value) {
      for (const [key, fieldValue] of Object.entries(value)) {
        if (!allFields.includes(key)) {
          continue
        }
        fields.push(key)
        values.push(fieldValue && this.tableSchemas[tableName].complexFields.includes(key) ? JSON.stringify(fieldValue) : fieldValue)
      }
    }
    return {
      fields,
      values,
    }
  }

  private getWhereSql<T>(
    tableName: TableName,
    options?: RowFilterOptions<T>,
  ) {
    const allFields: string[] = this.tableSchemas[tableName].fieldNames
    const values: unknown[] = []
    const filterValue: string[] = []
    if (options?.filter) {
      for (const [key, fieldValue] of Object.entries(options.filter)) {
        if (!allFields.includes(key) || fieldValue === undefined) {
          continue
        }
        if (isArray(fieldValue)) {
          filterValue.push(`${key} IN (${new Array(fieldValue.length).fill('?').join(', ')})`)
          values.push(...fieldValue)
        } else {
          filterValue.push(`${key} = ?`)
          values.push(fieldValue && this.tableSchemas[tableName].complexFields.includes(key) ? JSON.stringify(fieldValue) : fieldValue)
        }
      }
    }
    if (options?.fuzzyFilter) {
      for (const [key, fieldValue] of Object.entries(options.fuzzyFilter)) {
        if (!allFields.includes(key) || fieldValue === undefined) {
          continue
        }
        filterValue.push(`${key} LIKE '%' || ? || '%'`)
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

  private getSelectSql<T extends Record<string, unknown>>(
    tableName: TableName,
    options?: RowSelectOptions<T>
  ) {
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

  private getSelectOneSql<T extends Record<string, unknown>>(
    tableName: TableName,
    options?: RowSelectOneOptions<T>
  ) {
    const { sql, values } = this.getWhereSql(tableName, options)
    let orderBy = ''
    if (options?.sort && options.sort.length > 0) {
      orderBy = 'ORDER BY ' + options.sort.map((s) => `${s.field} ${s.type}`).join(', ')
    }
    const allFields: string[] = this.tableSchemas[tableName].fieldNames
    const fieldNames = allFields.filter((f) => !options?.ignoredFields?.includes(f)).join(', ')
    return {
      sql: `SELECT ${fieldNames} FROM ${tableName} ${sql} ${orderBy}`,
      values,
    }
  }

  private run(sql: string, ...args: unknown[]) {
    return new Promise<void>((resolve, reject) => {
      this.db.run(sql, args, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  private all<T extends Record<string, unknown>>(sql: string, complexFields: string[], ...args: unknown[]) {
    return new Promise<T[]>((resolve, reject) => {
      this.db.all(sql, args, (err, rows: T[]) => {
        if (err) {
          reject(err)
        } else {
          for (const row of rows) {
            this.restoreComplexFields(complexFields, row)
          }
          resolve(rows)
        }
      })
    })
  }

  private get<T extends Record<string, unknown>>(sql: string, complexFields: string[], ...args: unknown[]) {
    return new Promise<T | undefined>((resolve, reject) => {
      this.db.get(sql, args, (err, row: T | undefined) => {
        if (err) {
          reject(err)
        } else {
          if (row) {
            this.restoreComplexFields(complexFields, row)
          }
          resolve(row)
        }
      })
    })
  }

  private restoreComplexFields(complexFields: string[], row: Record<string, unknown>) {
    for (const field of complexFields) {
      const value = row[field]
      if (value && typeof value === 'string') {
        row[field] = JSON.parse(value)
      }
    }
    return row
  }
}

const isArray = (arg: unknown): arg is unknown[] => Array.isArray(arg)