export const isArray = (arg: unknown): arg is unknown[] => Array.isArray(arg)

/**
 * @public
 */
export const getKeys: <T>(obj: T) => (keyof T)[] = Object.keys
