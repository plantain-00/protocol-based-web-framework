import type { Readable } from 'stream'

export const isArray = (arg: unknown): arg is unknown[] => Array.isArray(arg)
/**
 * @public
 */
export const getKeys: <T>(obj: T) => (keyof T)[] = Object.keys

export function isReadable(stream: unknown): stream is Readable {
  return stream !== null &&
    typeof stream === 'object' &&
    typeof (stream as Readable).pipe === 'function'
}
