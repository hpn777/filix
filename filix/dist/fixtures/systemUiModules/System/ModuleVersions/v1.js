"use strict";
;
({
    dataProviderId: 'AppDB',
    idProperty: 'id',
    tableName: 'module_version',
    serviceCommand: 'GetData',
    initialCommand: 'GetColumnsDefinition',
    defaultSelect: 'module_version',
    extensionBar: [
        'moreContextMenu',
        'clearFiltersButton',
        'addGenericRow',
        'removeSelected',
    ],
    columns: [
        {
            name: 'moduleId',
            title: 'Module Id',
            type: 'number',
        },
        {
            name: 'config',
            title: 'Config',
            type: 'number',
            hidden: true,
        },
        {
            name: 'moduleName',
            title: 'Module Name',
            type: 'string',
            resolve: {
                dataProviderId: 'AppDB',
                underlyingField: 'moduleId',
                valueField: 'id',
                childrenTable: 'module',
                displayField: 'name',
            },
        },
    ],
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidjEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZml4dHVyZXMvc3lzdGVtVWlNb2R1bGVzL1N5c3RlbS9Nb2R1bGVWZXJzaW9ucy92MS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsQ0FBQztBQUFBLENBQUM7SUFDQSxjQUFjLEVBQUUsT0FBTztJQUN2QixVQUFVLEVBQUUsSUFBSTtJQUNoQixTQUFTLEVBQUUsZ0JBQWdCO0lBQzNCLGNBQWMsRUFBRSxTQUFTO0lBQ3pCLGNBQWMsRUFBRSxzQkFBc0I7SUFDdEMsYUFBYSxFQUFFLGdCQUFnQjtJQUMvQixZQUFZLEVBQUU7UUFDWixpQkFBaUI7UUFDakIsb0JBQW9CO1FBQ3BCLGVBQWU7UUFDZixnQkFBZ0I7S0FDakI7SUFDRCxPQUFPLEVBQUU7UUFDUDtZQUNFLElBQUksRUFBRSxVQUFVO1lBQ2hCLEtBQUssRUFBRSxXQUFXO1lBQ2xCLElBQUksRUFBRSxRQUFRO1NBQ2Y7UUFDRDtZQUNFLElBQUksRUFBRSxRQUFRO1lBQ2QsS0FBSyxFQUFFLFFBQVE7WUFDZixJQUFJLEVBQUUsUUFBUTtZQUNkLE1BQU0sRUFBRSxJQUFJO1NBQ2I7UUFDRDtZQUNFLElBQUksRUFBRSxZQUFZO1lBQ2xCLEtBQUssRUFBRSxhQUFhO1lBQ3BCLElBQUksRUFBRSxRQUFRO1lBQ2QsT0FBTyxFQUFFO2dCQUNQLGNBQWMsRUFBRSxPQUFPO2dCQUN2QixlQUFlLEVBQUUsVUFBVTtnQkFDM0IsVUFBVSxFQUFFLElBQUk7Z0JBQ2hCLGFBQWEsRUFBRSxRQUFRO2dCQUN2QixZQUFZLEVBQUUsTUFBTTthQUNyQjtTQUNGO0tBQ0Y7Q0FDRixDQUFDLENBQUEifQ==