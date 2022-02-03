/**
 * @path /
 */
type homePage = (
  query: {
    /**
     * @default 1
     */
    page?: number
  },
) => string
