"use strict";
;
({
    dataProviderId: 'TailLog',
    serviceCommand: 'GetColumnsDefinition',
    idProperty: 'id',
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
                metaData.tdAttr = `data-qtip="${Ext.util.Format.htmlEncode(value)}"`;
                return value;
            },
        },
    ],
    getRowClass(record) {
        let cls = '';
        if (record.data.type == 'E')
            cls = 'status-error';
        else if (record.data.type == 'W')
            cls = 'status-warning';
        return cls;
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidjEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZml4dHVyZXMvc3lzdGVtVWlNb2R1bGVzL1N5c3RlbS9TeXN0ZW1sb2d2aWV3ZXIvdjEuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLENBQUM7QUFBQSxDQUFDO0lBQ0EsY0FBYyxFQUFFLFNBQVM7SUFDekIsY0FBYyxFQUFFLHNCQUFzQjtJQUN0QyxVQUFVLEVBQUUsSUFBSTtJQUVoQixTQUFTLEVBQUUsUUFBUTtJQUNuQixZQUFZLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxZQUFZLENBQUM7SUFDL0MsT0FBTyxFQUFFO1FBQ1A7WUFDRSxJQUFJLEVBQUUsSUFBSTtZQUNWLEtBQUssRUFBRSxJQUFJO1lBQ1gsSUFBSSxFQUFFLFFBQVE7U0FDZjtRQUNEO1lBQ0UsSUFBSSxFQUFFLEtBQUs7WUFDWCxLQUFLLEVBQUUsU0FBUztZQUNoQixJQUFJLEVBQUUsTUFBTTtZQUNaLFFBQVEsQ0FBQyxLQUFLLEVBQUUsUUFBUTtnQkFDdEIsUUFBUSxDQUFDLE1BQU0sR0FBRyxjQUFjLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFBO2dCQUNwRSxPQUFPLEtBQUssQ0FBQTtZQUNkLENBQUM7U0FDRjtLQUNGO0lBQ0QsV0FBVyxDQUFDLE1BQU07UUFDaEIsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFBO1FBRVosSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxHQUFHO1lBQUUsR0FBRyxHQUFHLGNBQWMsQ0FBQTthQUM1QyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLEdBQUc7WUFBRSxHQUFHLEdBQUcsZ0JBQWdCLENBQUE7UUFFeEQsT0FBTyxHQUFHLENBQUE7SUFDWixDQUFDO0NBQ0YsQ0FBQyxDQUFBIn0=