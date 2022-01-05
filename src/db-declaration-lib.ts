export type RowSelectOptions<T> = Partial<{
  pagination: { take: number, skip: number }
}> & RowSelectOneOptions<T>

export type RowSelectOneOptions<T> = Partial<{
  ignoredFields: (keyof T)[]
  pickedFields: (keyof T)[]
  sort: { field: keyof T, type: 'asc' | 'desc' }[]
}> & RowFilterOptions<T>

export type RowFilterOptions<T> = Partial<{
  filter: { [P in keyof T]?: T[P] | readonly T[P][] }
  fuzzyFilter: { [P in keyof T]?: T[P] | readonly T[P][] }
  rawFilter: { sql: string, value: unknown[] }
}>

/**
 * @public
 */
export const getKeys: <T>(obj: T) => (keyof T)[] = Object.keys
