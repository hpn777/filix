;({
  dataProviderId: 'AppDB',
  idProperty: 'id',
  tableName: 'tab_preset',
  serviceCommand: 'GetData',
  defaultSelect: 'tab_preset',
  selectors: [
    {
      name: 'id',
      foreignTableName: 'control_preset',
      foreignColumnName: 'tabPresetId',
    },
  ],
  editable: true,
  deletable: true,
  extensionBar: [
    'moreContextMenu',
    'clearFiltersButton',
    'addGenericRow',
    'removeSelected',
  ],
  columns: [
    {
      name: 'typeId',
      title: 'Type',
      type: 'number',
      resolveView: {
        dataProviderId: 'AppDB',
        childrenTable: 'tab_type',
        valueField: 'id',
        displayField: 'name',
        addBlank: true,
      },
    },
    {
      name: 'userId',
      title: 'User Name',
      type: 'number',
      resolveView: {
        dataProviderId: 'AppDB',
        childrenTable: 'app_role',
        valueField: 'id',
        displayField: 'userName',
        addBlank: true,
      },
    },
    {
      name: 'id',
      title: 'Id',
      type: 'id',
    },
    {
      name: 'name',
      title: 'Name',
      type: 'text',
    },
    {
      name: 'config',
      title: 'Config',
      type: 'text',
      hidden: true,
    },
    {
      name: 'parentId',
      title: 'Parent',
      type: 'text',
      hidden: true,
    },
  ],
})
