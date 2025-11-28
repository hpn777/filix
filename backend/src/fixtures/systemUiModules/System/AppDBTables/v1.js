;({
  tableName: 'tables_schema',
  dataProviderId: 'AppDB',
  serviceCommand: 'GetData',
  selectors: [
    {
      columnName: 'name',
      foreignColumnName: 'tableName',
      foreignTableName: 'columns_schema',
    },
  ],

  extensionBar: ['moreContextMenu', 'createModules'],
})
