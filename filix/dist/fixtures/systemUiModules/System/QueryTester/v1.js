"use strict";
;
({
    dataProviderId: 'AppDB',
    idProperty: 'id',
    tableName: 'events',
    extensionBar: [
        'aceCodeEditor',
        Ext.create('Ext.container.Container', {
            id: 'queryOptionsContainer',
            layout: {
                type: 'hbox',
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
                        self.unsubscribe();
                        const tb = self.getDockedItems('toolbar')[0];
                        const items = tb.items;
                        const code = items.get('codeeditor-test').getValue();
                        const container = items.get('queryOptionsContainer');
                        const dataProvider = container.items
                            .get('dataProviderSelectorAce')
                            .getValue();
                        const apiRequest = {
                            command: 'GetData',
                            dataProviderId: dataProvider,
                            query: JSON.parse(code),
                        };
                        self.doSubscribe(apiRequest);
                    },
                },
            ],
        }),
    ],
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidjEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZml4dHVyZXMvc3lzdGVtVWlNb2R1bGVzL1N5c3RlbS9RdWVyeVRlc3Rlci92MS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsQ0FBQztBQUFBLENBQUM7SUFDQSxjQUFjLEVBQUUsT0FBTztJQUN2QixVQUFVLEVBQUUsSUFBSTtJQUNoQixTQUFTLEVBQUUsUUFBUTtJQUNuQixZQUFZLEVBQUU7UUFDWixlQUFlO1FBQ2YsR0FBRyxDQUFDLE1BQU0sQ0FBQyx5QkFBeUIsRUFBRTtZQUNwQyxFQUFFLEVBQUUsdUJBQXVCO1lBQzNCLE1BQU0sRUFBRTtnQkFDTixJQUFJLEVBQUUsTUFBTTtnQkFFWixLQUFLLEVBQUUsUUFBUTthQUNoQjtZQUNELE1BQU0sRUFBRSxHQUFHO1lBQ1gsS0FBSyxFQUFFLEdBQUc7WUFDVixNQUFNLEVBQUUsQ0FBQztZQUNULEtBQUssRUFBRTtnQkFDTCxXQUFXLEVBQUUsU0FBUztnQkFDdEIsV0FBVyxFQUFFLE9BQU87Z0JBQ3BCLFdBQVcsRUFBRSxLQUFLO2FBQ25CO1lBQ0QsUUFBUSxFQUFFO2dCQUNSLFVBQVUsRUFBRSxFQUFFO2dCQUNkLElBQUksRUFBRSxDQUFDO2dCQUNQLEtBQUssRUFBRTtvQkFDTCxPQUFPLEVBQUUsTUFBTTtpQkFDaEI7YUFDRjtZQUNELEtBQUssRUFBRTtnQkFDTDtvQkFDRSxLQUFLLEVBQUUsR0FBRztvQkFDVixNQUFNLEVBQUUsRUFBRTtvQkFFVixVQUFVLEVBQUUsZUFBZTtvQkFDM0IsS0FBSyxFQUFFLFVBQVU7b0JBQ2pCLFFBQVEsRUFBRSxLQUFLO29CQUNmLEVBQUUsRUFBRSx5QkFBeUI7b0JBQzdCLEtBQUssRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFO3dCQUNsQyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUM7d0JBQ2hCLElBQUksRUFBRTs0QkFDSjtnQ0FDRSxJQUFJLEVBQUUsZ0JBQWdCOzZCQUN2Qjs0QkFDRDtnQ0FDRSxJQUFJLEVBQUUsU0FBUzs2QkFDaEI7NEJBQ0Q7Z0NBQ0UsSUFBSSxFQUFFLE9BQU87NkJBQ2Q7eUJBQ0Y7cUJBQ0YsQ0FBQztvQkFDRixZQUFZLEVBQUUsTUFBTTtvQkFDcEIsVUFBVSxFQUFFLE1BQU07aUJBQ25CO2dCQUNEO29CQUNFLEtBQUssRUFBRSxRQUFRO29CQUNmLE1BQU0sRUFBRSxPQUFPO29CQUNmLFFBQVEsRUFBRSxLQUFLO29CQUNmLElBQUksRUFBRSxtREFBbUQ7b0JBRXpELE9BQU8sRUFBRSxVQUFVLEdBQUc7d0JBQ3BCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQTt3QkFFbEIsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTt3QkFDNUMsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQTt3QkFDdEIsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFBO3dCQUVwRCxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLENBQUE7d0JBQ3BELE1BQU0sWUFBWSxHQUFHLFNBQVMsQ0FBQyxLQUFLOzZCQUNqQyxHQUFHLENBQUMseUJBQXlCLENBQUM7NkJBQzlCLFFBQVEsRUFBRSxDQUFBO3dCQUNiLE1BQU0sVUFBVSxHQUFHOzRCQUNqQixPQUFPLEVBQUUsU0FBUzs0QkFDbEIsY0FBYyxFQUFFLFlBQVk7NEJBQzVCLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQzt5QkFDeEIsQ0FBQTt3QkFFRCxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFBO29CQUM5QixDQUFDO2lCQUNGO2FBQ0Y7U0FDRixDQUFDO0tBQ0g7Q0FDRixDQUFDLENBQUEifQ==