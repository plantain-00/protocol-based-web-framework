import express from 'express'
import * as bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import stream from 'stream'
import multer from 'multer'
import { getAndValidateRequestInput, respondHandleResult } from '../dist/nodejs'
import { apiSchemas } from './restful-api-backend-declaration'
import { initializeDatabase } from './sqlite-service'
import { HttpError } from './blog-service'

const app = express()
app.use(bodyParser.json())
app.use(cookieParser())

class MultipartToStream implements multer.StorageEngine {
  public _handleFile(_req: express.Request<{}, {}, {}>, file: Express.Multer.File, cb: (error: Error | null, info?: Partial<Express.Multer.File>) => void) {
    const pass = new stream.PassThrough()
    file.stream.pipe(pass)
    cb(null, {
      stream: pass,
    })
  }
  public _removeFile(_req: express.Request<{}, {}, {}>, _file: Express.Multer.File, cb: (error: Error | null, info?: Partial<Express.Multer.File>) => void) {
    cb(null)
  }
}

const upload = multer({
  storage: new MultipartToStream(),
})

for (const { method, url, validate, handler } of apiSchemas) {
  app[method](url, upload.any(), async (req: express.Request<{}, {}, {}>, res: express.Response<{}>) => {
    try {
      if (!handler) {
        throw new HttpError('this api handler is not binded', 500)
      }
      const input = getAndValidateRequestInput(req, validate, { myUserId: req.cookies.sid as number })
      if (typeof input === 'string') {
        throw new HttpError(input, 400)
      }
      const result = await handler(input)
      respondHandleResult(result, req, res)
    } catch (error: unknown) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500
      const message = error instanceof Error ? error.message : error
      res.status(statusCode).json({ message }).end()
    }
  })
}
app.listen(3000)

initializeDatabase()
