export interface IdField {
  id: number
}

export interface PaginationFields {
  /**
   * @default 0
   */
  skip?: number
  /**
   * @default 10
   */
  take?: number
}

export interface SortTypeField {
  /**
   * @default asc
   */
  sortType?: 'asc' | 'desc'
}

export interface MyUserIdField {
  myUserId: number
}
