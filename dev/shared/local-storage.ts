import { StorageAccessor } from '@protocol-based-web-framework/browser-storage'
import { GetItem, RemoveItem, SetItem, validations } from '../generated/local-storage-declaration'

const storageAccessor = new StorageAccessor(localStorage, validations)
export const getItem: GetItem = storageAccessor.getItem
export const setItem: SetItem = storageAccessor.setItem
export const removeItem: RemoveItem = storageAccessor.removeItem

setItem('post-key', {
  id: 1,
  blogId: 2,
  content: '',
})
console.info(getItem('post-key'))
