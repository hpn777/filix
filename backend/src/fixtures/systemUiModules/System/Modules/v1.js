;({
  dataProviderId: 'AppDB',
  idProperty: 'id',
  tableName: 'module',
  serviceCommand: 'GetData',
  multiSelect: true,
  defaultSelect: 'module',
  deletable: true,
  extensionBar: [
    'moreContextMenu',
    'clearFiltersButton',
    'addGenericRow',
    'removeSelected',
  ],
  selectors: [
    {
      columnName: 'id',
      foreignTableName: 'module_version',
      foreignColumnName: 'moduleId',
    },
  ],
  columns: [
    {
      name: 'owner_id',
      title: 'owner_id',
      type: 'number',
      hidden: true,
      resolveView: {
        dataProviderId: 'AppDB',
        childrenTable: 'user_data',
        valueField: 'id',
        displayField: 'userName',
        addBlank: true,
      },
    },
    {
      name: 'id',
      title: 'id',
      type: 'number',
    },
    {
      name: 'name',
      title: 'name',
      type: 'text',
    },
    {
      hidden: true,
      name: 'moduleClassName',
      title: 'moduleClassName',
      type: 'text',
    },
    {
      hidden: true,
      name: 'moduleType',
      title: 'moduleType',
      type: 'text',
    },
    {
      name: 'moduleGroup',
      title: 'moduleGroup',
      type: 'text',
    },
    {
      hidden: true,
      name: 'config',
      title: 'config',
      type: 'text',
    },
    {
      hidden: true,
      name: 'parentId',
      title: 'parentId',
      type: 'number',
    },
    {
      hidden: true,
      name: 'description',
      title: 'description',
      type: 'text',
    },
  ],
})
