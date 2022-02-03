import { StorageValidation } from "./storage-access-lib"

/**
 * @public
 */
export class StorageAccessor<T extends StorageValidation> {
  constructor(private storage: Storage, private validations: T[]) { }

  public getItem = <T>(key: string) => {
    const value = this.storage.getItem(key)
    if (value === null) {
      return undefined
    }
    try {
      const result = JSON.parse(value) as T
      const validation = this.validations.find((v) => v.key === key)
      if (validation) {
        if (!validation.validate(result)) {
          console.warn(validation.validate.errors?.[0]?.message)
          return undefined
        }
      }
      return result
    } catch {
      return undefined
    }
  }

  public setItem = <T>(key: string, value: T) => {
    const validation = this.validations.find((v) => v.key === key)
    if (validation) {
      if (!validation.validate(value)) {
        console.warn(validation.validate.errors?.[0]?.message)
        return
      }
    }
    this.storage.setItem(key, JSON.stringify(value))
  }

  public removeItem = (key: string) => {
    this.storage.removeItem(key)
  }
}
