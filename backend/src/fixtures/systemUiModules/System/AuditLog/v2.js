;({
  dataProviderId: 'AppDB',
  serviceCommand: 'GetData',
  initialCommand: 'GetColumnsDefinition',
  tableName: 'audit',
  idProperty: 'id',
  storeType: 'remote',
  extensionBar: ['moreContextMenu', 'filterMenu'],
  columns: [
    {
      name: 'request',
      title: 'Request',
      type: 'string',
      renderer(value, metaData) {
        const request = JSON.parse(value)
        const str = String(
          `<div style=\\"display: block;\\">${JSON.stringify(
            request,
            null,
            '\\t',
          )}</div>`,
        )
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/\\n/g, '&lt;br/&gt;')
          .replace(/\\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')

        metaData.tdAttr = `data-qtip="${str}"`
        return value
      },
    },
    {
      name: 'user_id',
      type: 'resolve',
      title: 'User',
      resolveView: {
        dataProviderId: 'AppDB',
        childrenTable: 'user_data',
        valueField: 'id',
        displayField: 'userName',
        addBlank: true,
      },
    },
    {
      name: 'timestamp',
      type: 'datetime',
      title: 'Timestamp',
      renderer: Common.Formatter.datetime,
    },
  ],
})
