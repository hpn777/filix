;({
  dataProviderId: 'Membership',
  idProperty: 'id',
  tableName: 'user_data',
  serviceCommand: 'GetUsers',
  saveServiceCommand: 'UpdateUser',
  defaultSelect: 'user_data',
  editable: true,
  deletable: false,
  extensionBar: [
    'moreContextMenu',
    'clearFiltersButton',
    'addGenericRow',
    'removeSelected',
  ],
  columns: [
    {
      name: 'id',
      title: 'Id',
      type: 'number',
      primaryKey: true,
      editable: false,
      order: 1,
    },
    {
      name: 'userName',
      title: 'User Name',
      type: 'text',
      allowBlank: false,
    },
    {
      name: 'email',
      title: 'email',
      type: 'text',
    },
    {
      name: 'displayName',
      title: 'displayName',
      type: 'text',
    },
    {
      name: 'active',
      title: 'active',
      type: 'boolean',
      allowBlank: false,
    },
  ],
})
