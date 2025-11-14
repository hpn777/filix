"use strict";
;
({
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
                const request = JSON.parse(value);
                const str = String(`<div style=\\"display: block;\\">${JSON.stringify(request, null, '\\t')}</div>`)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/\\n/g, '&lt;br/&gt;')
                    .replace(/\\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
                metaData.tdAttr = `data-qtip="${str}"`;
                return value;
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidjIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZml4dHVyZXMvc3lzdGVtVWlNb2R1bGVzL1N5c3RlbS9BdWRpdExvZy92Mi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsQ0FBQztBQUFBLENBQUM7SUFDQSxjQUFjLEVBQUUsT0FBTztJQUN2QixjQUFjLEVBQUUsU0FBUztJQUN6QixjQUFjLEVBQUUsc0JBQXNCO0lBQ3RDLFNBQVMsRUFBRSxPQUFPO0lBQ2xCLFVBQVUsRUFBRSxJQUFJO0lBQ2hCLFNBQVMsRUFBRSxRQUFRO0lBQ25CLFlBQVksRUFBRSxDQUFDLGlCQUFpQixFQUFFLFlBQVksQ0FBQztJQUMvQyxPQUFPLEVBQUU7UUFDUDtZQUNFLElBQUksRUFBRSxTQUFTO1lBQ2YsS0FBSyxFQUFFLFNBQVM7WUFDaEIsSUFBSSxFQUFFLFFBQVE7WUFDZCxRQUFRLENBQUMsS0FBSyxFQUFFLFFBQVE7Z0JBQ3RCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUE7Z0JBQ2pDLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FDaEIsb0NBQW9DLElBQUksQ0FBQyxTQUFTLENBQ2hELE9BQU8sRUFDUCxJQUFJLEVBQ0osS0FBSyxDQUNOLFFBQVEsQ0FDVjtxQkFDRSxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztxQkFDdEIsT0FBTyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUM7cUJBQ3JCLE9BQU8sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDO3FCQUNyQixPQUFPLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQztxQkFDdkIsT0FBTyxDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUM7cUJBQzlCLE9BQU8sQ0FBQyxNQUFNLEVBQUUsMEJBQTBCLENBQUMsQ0FBQTtnQkFFOUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxjQUFjLEdBQUcsR0FBRyxDQUFBO2dCQUN0QyxPQUFPLEtBQUssQ0FBQTtZQUNkLENBQUM7U0FDRjtRQUNEO1lBQ0UsSUFBSSxFQUFFLFNBQVM7WUFDZixJQUFJLEVBQUUsU0FBUztZQUNmLEtBQUssRUFBRSxNQUFNO1lBQ2IsV0FBVyxFQUFFO2dCQUNYLGNBQWMsRUFBRSxPQUFPO2dCQUN2QixhQUFhLEVBQUUsV0FBVztnQkFDMUIsVUFBVSxFQUFFLElBQUk7Z0JBQ2hCLFlBQVksRUFBRSxVQUFVO2dCQUN4QixRQUFRLEVBQUUsSUFBSTthQUNmO1NBQ0Y7UUFDRDtZQUNFLElBQUksRUFBRSxXQUFXO1lBQ2pCLElBQUksRUFBRSxVQUFVO1lBQ2hCLEtBQUssRUFBRSxXQUFXO1lBQ2xCLFFBQVEsRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVE7U0FDcEM7S0FDRjtDQUNGLENBQUMsQ0FBQSJ9