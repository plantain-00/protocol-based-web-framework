export type RowSelectOptions<T, TRaw = SqlRawFilter> = Partial<{
  pagination: { take: number, skip: number }
}> & RowSelectOneOptions<T, TRaw>

export type RowSelectOneOptions<T, TRaw = SqlRawFilter> = RowFilterOptions<T, TRaw> & RowSelectSortOption<T> & RowSelectProjectOption<T>

export type RowSelectProjectOption<T> = Partial<{
  ignoredFields: (keyof T)[]
  pickedFields: (keyof T)[]
}>

export type RowSelectSortOption<T> = Partial<{
  sort: { field: keyof T, type: 'asc' | 'desc' }[]
}>

export type RowFilterOptions<T, TRaw = SqlRawFilter> = Partial<{
  filter: { [P in keyof T]?: T[P] | readonly T[P][] }
  fuzzyFilter: { [P in keyof T]?: T[P] | readonly T[P][] }
  rawFilter: TRaw
}>

/**
 * @public
 */
export const getKeys: <T>(obj: T) => (keyof T)[] = Object.keys

export interface SqlRawFilter {
  sql: string
  value: unknown[]
}
