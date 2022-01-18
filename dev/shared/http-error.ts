export class HttpError extends Error {
  constructor(message: string, public statusCode = 500) {
    super(message)
  }
}
