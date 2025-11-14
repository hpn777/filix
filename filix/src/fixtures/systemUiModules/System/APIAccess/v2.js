;({
  dataProviderId: 'AppDB',
  idProperty: 'id',
  tableName: 'api_access',
  serviceCommand: 'GetData',
  editable: true,
  extensionBar: ['moreContextMenu', 'clearFiltersButton', 'addGenericRow'],
  columns: [
    {
      name: 'id',
      title: 'id',
      type: 'text',
      primaryKey: true,
      editable: false,
    },
    {
      name: 'audit',
      title: 'audit',
      type: 'boolean',
    },
    {
      name: 'disable',
      title: 'disable',
      type: 'boolean',
    },
    {
      name: 'enforce_user',
      title: 'enforce_user',
      type: 'boolean',
    },
    {
      name: 'enforce_role',
      title: 'enforce_role',
      type: 'boolean',
    },
  ],
})
