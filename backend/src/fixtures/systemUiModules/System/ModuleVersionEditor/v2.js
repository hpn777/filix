;({
  dataProviderId: 'AppDB',
  idProperty: 'id',
  tableName: 'module_version',
  serviceCommand: 'GetData',
  defaultSelect: 'module_version',
  extensionBar: ['moreContextMenu', 'clearFiltersButton', 'addGenericRow'],
  columns: [
    {
      name: 'id',
      title: 'Id',
      type: 'number',
      primaryKey: true,
    },
    {
      name: 'moduleId',
      title: 'Module Id',
      type: 'number',
      editable: false,
    },
    {
      name: 'config',
      title: 'Config',
      type: 'sourcecode',
    },
    {
      name: 'public',
      title: 'Public',
      type: 'boolean',
    },
  ],
  initialCommand: 'GetColumnsDefinition',
})
