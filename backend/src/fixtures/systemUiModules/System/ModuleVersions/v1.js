;({
  dataProviderId: 'AppDB',
  idProperty: 'id',
  tableName: 'module_version',
  serviceCommand: 'GetData',
  initialCommand: 'GetColumnsDefinition',
  defaultSelect: 'module_version',
  extensionBar: [
    'moreContextMenu',
    'clearFiltersButton',
    'addGenericRow',
    'removeSelected',
  ],
  columns: [
    {
      name: 'moduleId',
      title: 'Module Id',
      type: 'number',
    },
    {
      name: 'config',
      title: 'Config',
      type: 'number',
      hidden: true,
    },
    {
      name: 'moduleName',
      title: 'Module Name',
      type: 'string',
      resolve: {
        dataProviderId: 'AppDB',
        underlyingField: 'moduleId',
        valueField: 'id',
        childrenTable: 'module',
        displayField: 'name',
      },
    },
  ],
})
