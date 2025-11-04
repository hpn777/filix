export interface Tesseract<C = any> {
  createSession(query: {}): any
  getHeader(): any
  columns: Array<C>
  isRemote: boolean
}
