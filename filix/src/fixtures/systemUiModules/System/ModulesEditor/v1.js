;({
  dataProviderId: 'AppDB',
  idProperty: 'id',
  tableName: 'module',
  // "serviceCommand": "GetData",
  defaultSelect: 'module',
  extensionBar: ['moreContextMenu', 'clearFiltersButton', 'addGenericRow'],
  columns: [
    {
      name: 'owner_id',
      title: 'owner_id',
      type: 'text',
      hidden: true,
    },
    {
      name: 'id',
      title: 'id',
      type: 'id',
      primaryKey: true,
    },
    {
      name: 'name',
      title: 'Name',
      type: 'text',
    },
    {
      name: 'moduleClassName',
      title: 'Class Name',
      type: 'text',
    },
    {
      name: 'moduleType',
      title: 'Type',
      type: 'text',
    },
    {
      name: 'moduleGroup',
      title: 'Group',
      type: 'text',
      hidden: true,
    },
    {
      name: 'config',
      title: 'Config',
      type: 'sourcecode',
      hidden: true,
    },
    {
      name: 'parentId',
      title: 'Parent Id',
      type: 'number',
      hidden: true,
    },
    {
      name: 'description',
      title: 'Description',
      type: 'htmleditor',
    },
    {
      name: 'roles',
      title: 'Roles',
      type: 'multiselector',
      value(record) {
        return Number(record.id)
      },
      resolveView: {
        dataProviderId: 'AppDB',
        childrenTable: 'app_role',
        valueField: 'id',
        displayField: 'roleName',
        underlyingColumnName: 'id',
        xref: {
          dataProviderId: 'AppDB',
          childrenTable: 'module_roles',
          leftField: 'module_id',
          rightField: 'roles_id',
          underlyingColumnName: 'id',
        },
      },
    },
  ],
  initialCommand: 'GetColumnsDefinition',
})
