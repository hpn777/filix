;({
  dataProviderId: 'Membership',
  tableName: 'user_data',
  idProperty: 'id',
  serviceCommand: 'GetUsers',
  saveServiceCommand: 'UpdateUser',
  defaultSelect: 'user_data',
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
    },
    {
      name: 'email',
      title: 'Email',
      type: 'text',
    },
    {
      name: 'config',
      title: 'Config',
      type: 'text',
      hidden: true,
    },
    {
      name: 'displayName',
      title: 'Display Name',
      type: 'text',
    },
    {
      name: 'active',
      title: 'Active',
      type: 'boolean',
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
          childrenTable: 'user_roles',
          leftField: 'user_id',
          rightField: 'roles_id',
          underlyingColumnName: 'id',
        },
      },
    },
  ],
  initialCommand: 'GetColumnsDefinition',
})
