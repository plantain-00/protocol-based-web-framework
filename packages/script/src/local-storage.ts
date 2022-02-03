import { getBrowserStorageScript } from './util'

const outPath = process.env.LOCAL_STORAGE_OUTPUT_PATH || './src/local-storage-declaration.ts'

const browserStorageScript = getBrowserStorageScript(outPath, 'localStorage')

export default browserStorageScript
