import { getBrowserStorageScript } from './util'

const outPath = process.env.SESSION_STORAGE_OUTPUT_PATH || './src/session-storage-declaration.ts'

const browserStorageScript = getBrowserStorageScript(outPath, 'sessionStorage')

export default browserStorageScript
