"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateModule = void 0;
const tessio_1 = require("tessio");
class CreateModule {
    async CreateModule(request, subscription) {
        const params = request.parameters;
        const { tableName } = params;
        const remote = !!params.remote;
        const editable = !!(params.editable && !remote);
        const deletable = !!params.deletable;
        const multiSelect = !!params.multiselect;
        const appDB = await this.subscriptionManager.resolveModule('AppDB');
        const config = this.config;
        const selectors = [];
        let primaryKey = this.DBModels.getPrimaryKeyColumn(tableName);
        const columns = [];
        const tableColumns = this.DBModels.getColumns(tableName);
        tableColumns.forEach(columnMeta => {
            const columnDefinition = {
                name: columnMeta.name,
                title: columnMeta.name.replace(/_/g, ' '),
            };
            if (columnMeta.key || columnMeta.primary) {
                primaryKey = columnMeta.name;
                columnDefinition.primaryKey = true;
                if (columnMeta.serial) {
                    columnDefinition.editable = false;
                }
            }
            const prop = columnMeta;
            if (prop.referencedTableName) {
                columnDefinition.type = 'auto';
                columnDefinition.resolveView = {
                    dataProviderId: config.id,
                    childrenTable: prop.referencedTableName,
                    remote,
                    valueField: prop.referencedColumnName || 'id',
                    displayField: prop.referencedColumnName || 'id',
                    addBlank: !columnMeta.required,
                };
            }
            else {
                columnDefinition.type = this.DBModels.getAttributeType(columnMeta.type).type;
            }
            if (columnDefinition.type === 'text' && columnMeta.size) {
                columnDefinition.maxLength = columnMeta.size;
            }
            if (columnMeta.required) {
                columnDefinition.allowBlank = false;
            }
            if (columnMeta.defaultValue !== undefined && columnMeta.defaultValue !== null) {
                columnDefinition.defaultValue = columnMeta.defaultValue;
            }
            if (columnDefinition.name !== 'is_deleted' &&
                columnDefinition.name !== 'deleted_on') {
                columns.push(columnDefinition);
            }
        });
        this.DBModels.getReferencingColumns(tableName).forEach(({ tableName: foreignTableName, column }) => {
            selectors.push({
                columnName: column.referencedColumnName || primaryKey,
                foreignTableName,
                foreignColumnName: column.name,
            });
        });
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
        };
        const { genericGrid } = params;
        const { genericTree } = params;
        const { genericForm } = params;
        let module;
        let name;
        let versionConfig;
        if (genericGrid) {
            name = `${tableName} - grid`;
            module = {
                name,
                moduleClassName: 'GenericGrid',
                moduleGroup: `${this.config.moduleId} - CRUD`,
            };
            versionConfig = `(${JSON.stringify({
                ...moduleConfig,
                storeType: remote ? 'remote' : undefined,
            }, null, 4)})`;
        }
        if (genericTree && request.parameters.rootIdValue !== undefined) {
            const { parentIdField } = request.parameters;
            const { rootIdValue } = request.parameters;
            const { rootVisible } = request.parameters;
            name = `${tableName} - tree`;
            module = {
                name,
                moduleClassName: 'GenericTree',
                moduleGroup: `${this.config.moduleId} - CRUD`,
            };
            versionConfig = `(${JSON.stringify({
                ...moduleConfig,
                parentIdField,
                rootIdValue,
                rootVisible,
            }, null, 4)})`;
        }
        if (genericForm) {
            name = `${tableName} - form`;
            module = {
                name,
                moduleClassName: 'GenericForm',
                moduleGroup: `${this.config.moduleId} - CRUD`,
            };
            versionConfig = `(${JSON.stringify({
                ...moduleConfig,
            }, null, 4)})`;
        }
        const modules = appDB.evH.get('module').getLinq();
        const maxId = modules.max(x => x.id);
        const existingModule = tessio_1.lodash.maxBy(modules.where(m => m.name === name).toArray(), 'id');
        const moduleVersion = {
            public: true,
            config: versionConfig,
        };
        if (tessio_1.lodash.isEmpty(existingModule)) {
            module.id = maxId + 1;
            appDB.save('module', module, () => {
                appDB.save('module_roles', {
                    module_id: module.id,
                    roles_id: 1,
                });
                appDB.save('module_version', {
                    ...moduleVersion,
                    version: 1,
                    moduleId: module.id,
                });
            });
        }
        else {
            const latestVersion = tessio_1.lodash.maxBy(appDB.evH
                .get('module_version')
                .getLinq()
                .where(mv => mv.moduleId === existingModule.id)
                .toArray(), 'version');
            const version = latestVersion ? latestVersion.version + 1 : 1;
            appDB.save('module_version', {
                ...moduleVersion,
                version,
                moduleId: existingModule.id,
            });
        }
    }
}
exports.CreateModule = CreateModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlTW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL01vZHVsZXMvR2VuZXJpY0RCL21peGlucy9jcmVhdGVNb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsbUNBQW9DO0FBaUJwQyxNQUFhLFlBQVk7SUFDdkIsS0FBSyxDQUFDLFlBQVksQ0FBa0IsT0FBTyxFQUFFLFlBQTBCO1FBQ3JFLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUE7UUFDakMsTUFBTSxFQUFFLFNBQVMsRUFBRSxHQUFHLE1BQU0sQ0FBQTtRQUM1QixNQUFNLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQTtRQUM5QixNQUFNLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDL0MsTUFBTSxTQUFTLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUE7UUFDcEMsTUFBTSxXQUFXLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUE7UUFDeEMsTUFBTSxLQUFLLEdBQVEsTUFBTSxJQUFJLENBQUMsbUJBQW1CLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQ3hFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUE7UUFDMUIsTUFBTSxTQUFTLEdBQWUsRUFBRSxDQUFBO1FBQ2hDLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUE7UUFFN0QsTUFBTSxPQUFPLEdBQWUsRUFBRSxDQUFBO1FBQzlCLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFBO1FBRXhELFlBQVksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDaEMsTUFBTSxnQkFB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