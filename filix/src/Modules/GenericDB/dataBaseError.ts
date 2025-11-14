export class DataBaseError extends Error {
  constructor(error: Error) {
    super()
    this.name = 'DataBaseError'
    this.message = error.message
    this.stack = error.stack
    Object.setPrototypeOf(this, DataBaseError.prototype)
  }
}
