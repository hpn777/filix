;({
  dataProviderId: 'TailLog',
  serviceCommand: 'GetColumnsDefinition',
  idProperty: 'id',
  // "tableName": "clity",
  storeType: 'remote',
  extensionBar: ['moreContextMenu', 'filterMenu'],
  columns: [
    {
      name: 'id',
      title: 'Id',
      type: 'number',
    },
    {
      name: 'msg',
      title: 'Message',
      type: 'text',
      renderer(value, metaData) {
        metaData.tdAttr = `data-qtip="${Ext.util.Format.htmlEncode(value)}"`
        return value
      },
    },
  ],
  getRowClass(record) {
    let cls = ''

    if (record.data.type == 'E') cls = 'status-error'
    else if (record.data.type == 'W') cls = 'status-warning'

    return cls
  },
})
