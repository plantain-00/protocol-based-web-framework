/**
 * @path /
 */
declare function homePage(query: {
  /**
   * @default 1
   */
  page?: number
}): string

/**
 * @path /blogs/{id}
 */
declare function blogPage(path: { id: number }): string
