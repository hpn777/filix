"use strict";
;
({
    dataProviderId: 'AppDB',
    idProperty: 'id',
    tableName: 'module',
    serviceCommand: 'GetData',
    multiSelect: true,
    defaultSelect: 'module',
    deletable: true,
    extensionBar: [
        'moreContextMenu',
        'clearFiltersButton',
        'addGenericRow',
        'removeSelected',
    ],
    selectors: [
        {
            columnName: 'id',
            foreignTableName: 'module_version',
            foreignColumnName: 'moduleId',
        },
    ],
    columns: [
        {
            name: 'owner_id',
            title: 'owner_id',
            type: 'number',
            hidden: true,
            resolveView: {
                dataProviderId: 'AppDB',
                childrenTable: 'user_data',
                valueField: 'id',
                displayField: 'userName',
                addBlank: true,
            },
        },
        {
            name: 'id',
            title: 'id',
            type: 'number',
        },
        {
            name: 'name',
            title: 'name',
            type: 'text',
        },
        {
            hidden: true,
            name: 'moduleClassName',
            title: 'moduleClassName',
            type: 'text',
        },
        {
            hidden: true,
            name: 'moduleType',
            title: 'moduleType',
            type: 'text',
        },
        {
            name: 'moduleGroup',
            title: 'moduleGroup',
            type: 'text',
        },
        {
            hidden: true,
            name: 'config',
            title: 'config',
            type: 'text',
        },
        {
            hidden: true,
            name: 'parentId',
            title: 'parentId',
            type: 'number',
        },
        {
            hidden: true,
            name: 'description',
            title: 'description',
            type: 'text',
        },
    ],
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidjEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZml4dHVyZXMvc3lzdGVtVWlNb2R1bGVzL1N5c3RlbS9Nb2R1bGVzL3YxLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxDQUFDO0FBQUEsQ0FBQztJQUNBLGNBQWMsRUFBRSxPQUFPO0lBQ3ZCLFVBQVUsRUFBRSxJQUFJO0lBQ2hCLFNBQVMsRUFBRSxRQUFRO0lBQ25CLGNBQWMsRUFBRSxTQUFTO0lBQ3pCLFdBQVcsRUFBRSxJQUFJO0lBQ2pCLGFBQWEsRUFBRSxRQUFRO0lBQ3ZCLFNBQVMsRUFBRSxJQUFJO0lBQ2YsWUFBWSxFQUFFO1FBQ1osaUJBQWlCO1FBQ2pCLG9CQUFvQjtRQUNwQixlQUFlO1FBQ2YsZ0JBQWdCO0tBQ2pCO0lBQ0QsU0FBUyxFQUFFO1FBQ1Q7WUFDRSxVQUFVLEVBQUUsSUFBSTtZQUNoQixnQkFBZ0IsRUFBRSxnQkFBZ0I7WUFDbEMsaUJBQWlCLEVBQUUsVUFBVTtTQUM5QjtLQUNGO0lBQ0QsT0FBTyxFQUFFO1FBQ1A7WUFDRSxJQUFJLEVBQUUsVUFBVTtZQUNoQixLQUFLLEVBQUUsVUFBVTtZQUNqQixJQUFJLEVBQUUsUUFBUTtZQUNkLE1BQU0sRUFBRSxJQUFJO1lBQ1osV0FBVyxFQUFFO2dCQUNYLGNBQWMsRUFBRSxPQUFPO2dCQUN2QixhQUFhLEVBQUUsV0FBVztnQkFDMUIsVUFBVSxFQUFFLElBQUk7Z0JBQ2hCLFlBQVksRUFBRSxVQUFVO2dCQUN4QixRQUFRLEVBQUUsSUFBSTthQUNmO1NBQ0Y7UUFDRDtZQUNFLElBQUksRUFBRSxJQUFJO1lBQ1YsS0FBSyxFQUFFLElBQUk7WUFDWCxJQUFJLEVBQUUsUUFBUTtTQUNmO1FBQ0Q7WUFDRSxJQUFJLEVBQUUsTUFBTTtZQUNaLEtBQUssRUFBRSxNQUFNO1lBQ2IsSUFBSSxFQUFFLE1BQU07U0FDYjtRQUNEO1lBQ0UsTUFBTSxFQUFFLElBQUk7WUFDWixJQUFJLEVBQUUsaUJBQWlCO1lBQ3ZCLEtBQUssRUFBRSxpQkFBaUI7WUFDeEIsSUFBSSxFQUFFLE1BQU07U0FDYjtRQUNEO1lBQ0UsTUFBTSxFQUFFLElBQUk7WUFDWixJQUFJLEVBQUUsWUFBWTtZQUNsQixLQUFLLEVBQUUsWUFBWTtZQUNuQixJQUFJLEVBQUUsTUFBTTtTQUNiO1FBQ0Q7WUFDRSxJQUFJLEVBQUUsYUFBYTtZQUNuQixLQUFLLEVBQUUsYUFBYTtZQUNwQixJQUFJLEVBQUUsTUFBTTtTQUNiO1FBQ0Q7WUFDRSxNQUFNLEVBQUUsSUFBSTtZQUNaLElBQUksRUFBRSxRQUFRO1lBQ2QsS0FBSyxFQUFFLFFBQVE7WUFDZixJQUFJLEVBQUUsTUFBTTtTQUNiO1FBQ0Q7WUFDRSxNQUFNLEVBQUUsSUFBSTtZQUNaLElBQUksRUFBRSxVQUFVO1lBQ2hCLEtBQUssRUFBRSxVQUFVO1lBQ2pCLElBQUksRUFBRSxRQUFRO1NBQ2Y7UUFDRDtZQUNFLE1BQU0sRUFBRSxJQUFJO1lBQ1osSUFBSSxFQUFFLGFBQWE7WUFDbkIsS0FBSyxFQUFFLGFBQWE7WUFDcEIsSUFBSSxFQUFFLE1BQU07U0FDYjtLQUNGO0NBQ0YsQ0FBQyxDQUFBIn0=