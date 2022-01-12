/**
 * @path /
 */
declare function homePage(): string

/**
 * @path /blogs/{id}
 */
declare function blogPage(path: { id: number }): string
