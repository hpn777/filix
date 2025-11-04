import { Subscription } from 'Model/subscriptions'
import { lodash as _ } from 'tessio'
import { Module as GenericDB } from '../index'

interface ModuleRecord {
  id: number
  name: string
  moduleClassName: string
  moduleGroup: string
}

interface ModuleVersionRecord {
  version: number
  moduleId: number
  public: boolean
  config: string
}

export class CreateModule {
  async CreateModule(this: GenericDB, request, subscription: Subscription) {
    const params = request.parameters
    const { tableName } = params
    const remote = !!params.remote
    const editable = !!(params.editable && !remote)
    const deletable = !!params.deletable
    const multiSelect = !!params.multiselect
    const appDB: any = await this.subscriptionManager.getModule('AppDB')
    const config = this.config
    const selectors: Array<any> = []
    let primaryKey = this.DBModels.getPrimaryKeyColumn(tableName)

    const columns: Array<any> = []
    const tableColumns = this.DBModels.getColumns(tableName)

    tableColumns.forEach(columnMeta => {
      const columnDefinition: any = {
        name: columnMeta.name,
        title: columnMeta.name.replace(/_/g, ' '),
      }

      if (columnMeta.primaryKey) {
        primaryKey = columnMeta.name
        columnDefinition.primaryKey = true
        if (columnMeta.autoIncrement) {
          columnDefinition.editable = false
        }
      }

      if (columnMeta.referencedTableName) {
        columnDefinition.type = 'auto'
        columnDefinition.resolveView = {
          dataProviderId: config.id,
          childrenTable: columnMeta.referencedTableName,
          remote,
          valueField: columnMeta.referencedColumnName || 'id',
          displayField: columnMeta.referencedColumnName || 'id',
          addBlank: !columnMeta.notNull,
        }
      } else {
        columnDefinition.type = this.DBModels.getAttributeType(
          columnMeta.dataType,
        ).type
      }

      if (columnDefinition.type === 'text' && columnMeta.maxLength) {
        columnDefinition.maxLength = columnMeta.maxLength
      }
      if (columnMeta.notNull) {
        columnDefinition.allowBlank = false
      }

      if (columnMeta.defaultValue !== undefined && columnMeta.defaultValue !== null) {
        columnDefinition.defaultValue = columnMeta.defaultValue
      }

      if (
        columnDefinition.name !== 'is_deleted' &&
        columnDefinition.name !== 'deleted_on'
      ) {
        columns.push(columnDefinition)
      }
    })

    this.DBModels.getReferencingColumns(tableName).forEach(({ tableName: foreignTableName, column }) => {
      selectors.push({
        columnName: column.referencedColumnName || primaryKey,
        foreignTableName,
        foreignColumnName: column.name,
      })
    })

    const moduleConfig = {
      dataProviderId: config.id,
      idProperty: primaryKey,
      tableName,
      serviceCommand: 'GetData',
      initialCommand: 'GetColumnsDefinition',
      defaultSelect: tableName,
      selectors,
      multiSelect,
      editable,
      deletable,
      extensionBar: [
        'moreContextMenu',
        'clearFiltersButton',
        'addGenericRow',
        'removeSelected',
      ],
      columns,
    }

    const { genericGrid } = params
    const { genericTree } = params
    const { genericForm } = params

    let module
    let name
    let versionConfig

    if (genericGrid) {
      name = `${tableName} - grid`
      module = {
        name,
        moduleClassName: 'GenericGrid',
        moduleGroup: `${this.config.moduleId} - CRUD`,
      }
      versionConfig = `(${JSON.stringify(
        {
          ...moduleConfig,
          storeType: remote ? 'remote' : undefined,
        },
        null,
        4,
      )})`
    }

    if (genericTree && request.parameters.rootIdValue !== undefined) {
      const { parentIdField } = request.parameters // "business_classification_parent_id"
      const { rootIdValue } = request.parameters // 999
      const { rootVisible } = request.parameters
      name = `${tableName} - tree`
      module = {
        name,
        moduleClassName: 'GenericTree',
        moduleGroup: `${this.config.moduleId} - CRUD`,
      }
      versionConfig = `(${JSON.stringify(
        {
          ...moduleConfig,
          parentIdField,
          rootIdValue,
          rootVisible,
        },
        null,
        4,
      )})`
    }

    if (genericForm) {
      name = `${tableName} - form`
      module = {
        name,
        moduleClassName: 'GenericForm',
        moduleGroup: `${this.config.moduleId} - CRUD`,
      }
      versionConfig = `(${JSON.stringify(
        {
          ...moduleConfig,
        },
        null,
        4,
      )})`
    }

    const modules = appDB.evH.get('module').getLinq()
    const maxId = modules.max(x => x.id)

    const existingModule = _.maxBy(
      modules.where(m => m.name === name).toArray(),
      'id',
    ) as ModuleRecord | undefined

    const moduleVersion: Omit<ModuleVersionRecord, 'version' | 'moduleId'> = {
      public: true,
      config: versionConfig,
    }

    if (_.isEmpty(existingModule)) {
      module.id = maxId + 1
      appDB.save('module', module, () => {
        appDB.save('module_roles', {
          module_id: module.id,
          roles_id: 1,
        })
        appDB.save('module_version', {
          ...moduleVersion,
          version: 1,
          moduleId: module.id,
        })
      })
    } else {
      // add only version
      const latestVersion = _.maxBy(
        appDB.evH
          .get('module_version')
          .getLinq()
          .where(mv => mv.moduleId === existingModule.id)
          .toArray(),
        'version',
      ) as ModuleVersionRecord | undefined
      const version = latestVersion ? latestVersion.version + 1 : 1
      appDB.save('module_version', {
        ...moduleVersion,
        version,
        moduleId: existingModule.id,
      })
    }
  }
}
