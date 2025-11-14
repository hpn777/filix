import { logger } from '../../../utils'
import { DataBaseError } from '../dataBaseError'
import { Module as GenericDB } from '../index'

export type TKeyValue<Value> = {
  [x: string]: Value
}

export class RowsToDelete {
  private readonly idProperty = ''

  constructor(private dataBase: GenericDB, private dataCache: any) {
    this.idProperty = this.dataCache.idProperty
  }

  async getFromDataBase<IdPropertyType>(
    tableName: string,
    columName: string,
    rowIds: number[] | string[] | (number | string)[],
  ): Promise<IdPropertyType[] | null> {
    if (!tableName || !columName) {
      logger.error('TableName and columName are required', {
        module: 'RowsToDelete',
      })

      return null
    }

    try {
      const dataBaseQueryResult = await this.dataBase.runDBQuery({
        tableName,
        filter: [
          {
            field: columName,
            value: rowIds,
            comparison: 'in',
          },
        ],
      })

      return dataBaseQueryResult?.map(
        (item: TKeyValue<IdPropertyType>): IdPropertyType =>
          this.getIdPropertyValue<IdPropertyType>(item),
      )
    } catch (error: unknown) {
      if (error instanceof DataBaseError) {
        logger.error(error.message, { module: 'RowsToDelete' })
      } else {
        logger.error('Unexpected error', {
          module: 'RowsToDelete',
          objectOrArray: error,
        })
      }
    }

    return null
  }

  getFromDataCache<IdPropertyType>(
    columName: string,
    rowIds: IdPropertyType[] | (number | string)[],
  ): IdPropertyType[] | null {
    try {
      return this.dataCache
        .getLinq()
        .where((item: TKeyValue<IdPropertyType>): boolean =>
          (rowIds as any[]).includes(item[columName]),
        )
        .select(this.getIdPropertyValue.bind(this))
        .toArray()
    } catch (error: any) {
      logger.error(`Error retrieving data from cache: ${error}`, {
        module: 'RowsToDelete',
        objectOrArray: error,
        stack: error.stack,
      })
    }

    return null
  }

  private getIdPropertyValue<IdPropertyType>(
    item: TKeyValue<IdPropertyType>,
  ): IdPropertyType {
    return item[this.idProperty]
  }
}
