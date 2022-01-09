import type { Db, Filter, Document, Sort } from 'mongodb'
import { RowFilterOptions, RowSelectOneOptions, RowSelectOptions, RowSelectProjectOption, RowSelectSortOption } from './db-declaration-lib'
import { isArray } from './utils'

/**
 * @public
 */
export class MongodbAccessor<TableName extends string> {
  constructor(private db: Db, private tableSchemas: Record<TableName, { fieldNames: string[] }>) {
  }

  public insertRow = async <T extends Record<string, unknown>>(
    tableName: TableName,
    value: T,
  ) => {
    const values = this.getValues(tableName, value)
    const result = await this.db.collection(tableName).insertOne(values)
    return result.insertedId
  }

  public updateRow = async<T extends Record<string, unknown>>(
    tableName: TableName,
    value?: T,
    options?: RowFilterOptions<T, MongodbRawFilter>,
  ) => {
    const values = this.getValues(tableName, value)
    const filter = this.getFilter(tableName, options)
    const updateResult = await this.db.collection(tableName).updateOne(filter, { $set: values })
    return updateResult.modifiedCount
  }

  public deleteRow = async<T>(
    tableName: TableName,
    options?: RowFilterOptions<T, MongodbRawFilter>,
  ) => {
    const filter = this.getFilter(tableName, options)
    await this.db.collection(tableName).deleteOne(filter)
  }

  public selectRow = async<T extends Record<string, unknown>>(
    tableName: TableName,
    options?: RowSelectOptions<T, MongodbRawFilter>
  ) => {
    const filter = this.getFilter(tableName, options)
    let cursor = this.db.collection(tableName).find(filter)
    const sort = this.getSort(options)
    if (sort) {
      cursor = cursor.sort(sort)
    }
    if (options?.pagination) {
      cursor = cursor.skip(options.pagination.skip).limit(options.pagination.take)
    }
    const projection = this.getProjection(tableName, options)
    return cursor.project(projection).toArray()
  }

  public countRow = async<T>(
    tableName: TableName,
    options?: RowFilterOptions<T, MongodbRawFilter>
  ) => {
    const filter = this.getFilter(tableName, options)
    return this.db.collection(tableName).count(filter)
  }

  public getRow = async<T extends Record<string, unknown>>(
    tableName: TableName,
    options?: RowSelectOneOptions<T, MongodbRawFilter>
  ) => {
    const filter = this.getFilter(tableName, options)
    const sort = this.getSort(options)
    const projection = this.getProjection(tableName, options)
    const result = await this.db.collection(tableName).findOne(filter, {
      sort,
      projection,
    })
    return result === null ? undefined : result
  }

  private getValues = <T extends Record<string, unknown>>(
    tableName: TableName,
    value?: T,
  ) => {
    const values: Record<string, unknown> = {}
    const allFields: string[] = this.tableSchemas[tableName].fieldNames
    if (value) {
      for (const [key, fieldValue] of Object.entries(value)) {
        if (!allFields.includes(key)) {
          continue
        }
        values[key] = fieldValue
      }
    }
    return values
  }

  private getFilter = <T>(
    tableName: TableName,
    options?: RowFilterOptions<T, MongodbRawFilter>,
  ) => {
    const allFields: string[] = this.tableSchemas[tableName].fieldNames
    let filter: Filter<Document> = {}
    if (options?.filter) {
      for (const [key, fieldValue] of Object.entries(options.filter)) {
        if (!allFields.includes(key) || fieldValue === undefined) {
          continue
        }
        if (isArray(fieldValue)) {
          filter[key] = {
            $in: fieldValue,
          }
        } else {
          filter[key] = fieldValue
        }
      }
    }
    if (options?.fuzzyFilter) {
      for (const [key, fieldValue] of Object.entries(options.fuzzyFilter)) {
        if (!allFields.includes(key) || fieldValue === undefined) {
          continue
        }
        filter[key] = {
          $regex: new RegExp(String(fieldValue), 'ig'),
        }
      }
    }
    if (options?.rawFilter) {
      filter = {
        ...filter,
        ...options.rawFilter,
      }
    }
    return filter
  }

  private getSort = <T extends Record<string, unknown>>(
    options?: RowSelectSortOption<T>,
  ) => {
    const sort: Sort = {}
    if (options?.sort && options.sort.length > 0) {
      for (const s of options.sort) {
        sort[s.field as string] = s.type
      }
      return sort
    }
    return undefined
  }

  private getProjection = <T extends Record<string, unknown>>(
    tableName: TableName,
    options?: RowSelectProjectOption<T>,
  ) => {
    const allFields: string[] = this.tableSchemas[tableName].fieldNames
    const projection: Record<string, boolean> = {}
    for (const f of allFields) {
      if ((!options?.pickedFields || options.pickedFields.includes(f)) && !options?.ignoredFields?.includes(f)) {
        projection[f] = true
      }
    }
    return projection
  }
}

/**
 * @public
 */
export type MongodbRawFilter = Filter<unknown>
