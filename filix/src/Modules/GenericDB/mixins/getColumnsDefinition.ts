import { Module as GenericDB } from '../index'
import filterOutDeletedAndOwned from './utils/filterOutDeletedAndOwned'

export class GetColumnsDefinition {
  GetColumnsDefinition(this: GenericDB, request, subscription) {
    const { query } = request.parameters
    const { tableName } = request.parameters
    let simpleHeader

    if (query) {
      const session = this.evH.createSession(query, true)
      simpleHeader = session.getSimpleHeader()
    } else if (tableName) {
      const tesseract = this.evH.get(tableName)
      if (tesseract) {
        simpleHeader = tesseract.getSimpleHeader(true)
      }
    }

    simpleHeader = simpleHeader?.filter(filterOutDeletedAndOwned) ?? []
    if (simpleHeader) {
      subscription.publish(
        {
          header: simpleHeader,
          type: 'reset',
        },
        request.requestId,
      )
    } else {
      subscription.publishError(
        { message: `Dataset: "${tableName || query?.table}" dosn't exist.` },
        request.requestId,
      )
    }
  }
}
