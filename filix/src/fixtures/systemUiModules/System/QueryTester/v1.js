;({
  dataProviderId: 'AppDB',
  idProperty: 'id',
  tableName: 'events',
  extensionBar: [
    'aceCodeEditor',
    Ext.create('Ext.container.Container', {
      id: 'queryOptionsContainer',
      layout: {
        type: 'hbox',
        // pack: 'start',
        align: 'center',
      },
      height: 100,
      width: 500,
      border: 1,
      style: {
        borderColor: '#000000',
        borderStyle: 'solid',
        borderWidth: '1px',
      },
      defaults: {
        labelWidth: 80,
        flex: 1,
        style: {
          padding: '10px',
        },
      },
      items: [
        {
          width: 250,
          height: 50,
          // value: "CoreBusMonitor",
          fieldLabel: 'Data Provider',
          xtype: 'combobox',
          editable: false,
          id: 'dataProviderSelectorAce',
          store: Ext.create('Ext.data.Store', {
            fields: ['type'],
            data: [
              {
                type: 'CoreBusMonitor',
              },
              {
                type: 'ParamDB',
              },
              {
                type: 'AppDB',
              },
            ],
          }),
          displayField: 'type',
          valueField: 'type',
        },
        {
          xtype: 'button',
          itemId: 'goBtn',
          disabled: false,
          text: '<span style=\\"font-weight:bold\\">Request</span>',

          handler: function (btn) {
            self.unsubscribe()

            const tb = self.getDockedItems('toolbar')[0]
            const items = tb.items
            const code = items.get('codeeditor-test').getValue()

            const container = items.get('queryOptionsContainer')
            const dataProvider = container.items
              .get('dataProviderSelectorAce')
              .getValue()
            const apiRequest = {
              command: 'GetData',
              dataProviderId: dataProvider,
              query: JSON.parse(code),
            }

            self.doSubscribe(apiRequest)
          },
        },
      ],
    }),
  ],
})
