"use strict";
;
({
    dataProviderId: 'AppDB',
    idProperty: 'id',
    tableName: 'api_access_app_role',
    serviceCommand: 'GetData',
    includeLeafs: true,
    editable: true,
    extensionBar: [
        'moreContextMenu',
        'clearFiltersButton',
        'addGenericRow',
        'removeSelected',
        'groupingEditor',
    ],
    columns: [
        {
            name: 'id',
            title: 'id',
            type: 'number',
            primaryKey: true,
            editable: false,
            hidden: true,
        },
        {
            name: 'api_access_id',
            title: 'API',
            type: 'auto',
            allowBlank: false,
            formSortOrder: 1,
            resolveView: {
                dataProviderId: 'AppDB',
                valueField: 'id',
                childrenTable: 'api_access',
                displayField: 'id',
            },
        },
        {
            name: 'app_role_id',
            title: 'Role ID',
            type: 'auto',
            allowBlank: false,
            formSortOrder: 2,
            resolveView: {
                dataProviderId: 'AppDB',
                valueField: 'id',
                childrenTable: 'app_role',
                displayField: 'roleName',
            },
        },
    ],
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidjEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZml4dHVyZXMvc3lzdGVtVWlNb2R1bGVzL1N5c3RlbS9BcGlBY2Nlc3NSaWdodHMvdjEuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLENBQUM7QUFBQSxDQUFDO0lBQ0EsY0FBYyxFQUFFLE9BQU87SUFDdkIsVUFBVSxFQUFFLElBQUk7SUFDaEIsU0FBUyxFQUFFLHFCQUFxQjtJQUNoQyxjQUFjLEVBQUUsU0FBUztJQUN6QixZQUFZLEVBQUUsSUFBSTtJQUNsQixRQUFRLEVBQUUsSUFBSTtJQUNkLFlBQVksRUFBRTtRQUNaLGlCQUFpQjtRQUNqQixvQkFBb0I7UUFDcEIsZUFBZTtRQUNmLGdCQUFnQjtRQUNoQixnQkFBZ0I7S0FDakI7SUFDRCxPQUFPLEVBQUU7UUFDUDtZQUNFLElBQUksRUFBRSxJQUFJO1lBQ1YsS0FBSyxFQUFFLElBQUk7WUFDWCxJQUFJLEVBQUUsUUFBUTtZQUNkLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLFFBQVEsRUFBRSxLQUFLO1lBQ2YsTUFBTSxFQUFFLElBQUk7U0FDYjtRQUNEO1lBQ0UsSUFBSSxFQUFFLGVBQWU7WUFDckIsS0FBSyxFQUFFLEtBQUs7WUFDWixJQUFJLEVBQUUsTUFBTTtZQUNaLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLGFBQWEsRUFBRSxDQUFDO1lBQ2hCLFdBQVcsRUFBRTtnQkFDWCxjQUFjLEVBQUUsT0FBTztnQkFDdkIsVUFBVSxFQUFFLElBQUk7Z0JBQ2hCLGFBQWEsRUFBRSxZQUFZO2dCQUMzQixZQUFZLEVBQUUsSUFBSTthQUNuQjtTQUNGO1FBQ0Q7WUFDRSxJQUFJLEVBQUUsYUFBYTtZQUNuQixLQUFLLEVBQUUsU0FBUztZQUNoQixJQUFJLEVBQUUsTUFBTTtZQUNaLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLGFBQWEsRUFBRSxDQUFDO1lBQ2hCLFdBQVcsRUFBRTtnQkFDWCxjQUFjLEVBQUUsT0FBTztnQkFDdkIsVUFBVSxFQUFFLElBQUk7Z0JBQ2hCLGFBQWEsRUFBRSxVQUFVO2dCQUN6QixZQUFZLEVBQUUsVUFBVTthQUN6QjtTQUNGO0tBQ0Y7Q0FDRixDQUFDLENBQUEifQ==