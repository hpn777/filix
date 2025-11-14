;({
  dataProviderId: 'AppDB',
  idProperty: 'id',
  tableName: 'app_role',
  serviceCommand: 'GetData',
  defaultSelect: 'app_role',
  editable: true,
  deletable: true,
  extensionBar: ['moreContextMenu', 'clearFiltersButton', 'addGenericRow'],
  columns: [
    {
      name: 'id',
      title: 'Id',
      type: 'number',
      primaryKey: true,
      defaultValue: '0',
    },
    {
      name: 'roleName',
      title: 'Name',
      type: 'text',
    },
  ],
})
