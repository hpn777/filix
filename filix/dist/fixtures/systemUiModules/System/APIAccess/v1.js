"use strict";
;
({
    dataProviderId: 'AppDB',
    idProperty: 'id',
    tableName: 'api_access',
    serviceCommand: 'GetData',
    editable: true,
    deletable: true,
    extensionBar: ['moreContextMenu', 'clearFiltersButton', 'addGenericRow'],
    columns: [
        {
            name: 'roleId',
            title: 'roleId',
            type: 'number',
            resolveView: {
                dataProviderId: 'AppDB',
                childrenTable: 'app_role',
                valueField: 'id',
                displayField: 'roleName',
                addBlank: true,
            },
        },
        {
            name: 'id',
            title: 'id',
            type: 'text',
            primaryKey: true,
            editable: false,
        },
        {
            name: 'audit',
            title: 'audit',
            type: 'boolean',
        },
        {
            name: 'disable',
            title: 'disable',
            type: 'boolean',
        },
        {
            name: 'enforce_user',
            title: 'enforce_user',
            type: 'boolean',
        },
        {
            name: 'enforce_role',
            title: 'enforce_role',
            type: 'boolean',
        },
    ],
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidjEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZml4dHVyZXMvc3lzdGVtVWlNb2R1bGVzL1N5c3RlbS9BUElBY2Nlc3MvdjEuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLENBQUM7QUFBQSxDQUFDO0lBQ0EsY0FBYyxFQUFFLE9BQU87SUFDdkIsVUFBVSxFQUFFLElBQUk7SUFDaEIsU0FBUyxFQUFFLFlBQVk7SUFDdkIsY0FBYyxFQUFFLFNBQVM7SUFDekIsUUFBUSxFQUFFLElBQUk7SUFDZCxTQUFTLEVBQUUsSUFBSTtJQUNmLFlBQVksRUFBRSxDQUFDLGlCQUFpQixFQUFFLG9CQUFvQixFQUFFLGVBQWUsQ0FBQztJQUN4RSxPQUFPLEVBQUU7UUFDUDtZQUNFLElBQUksRUFBRSxRQUFRO1lBQ2QsS0FBSyxFQUFFLFFBQVE7WUFDZixJQUFJLEVBQUUsUUFBUTtZQUNkLFdBQVcsRUFBRTtnQkFDWCxjQUFjLEVBQUUsT0FBTztnQkFDdkIsYUFBYSxFQUFFLFVBQVU7Z0JBQ3pCLFVBQVUsRUFBRSxJQUFJO2dCQUNoQixZQUFZLEVBQUUsVUFBVTtnQkFDeEIsUUFBUSxFQUFFLElBQUk7YUFDZjtTQUNGO1FBQ0Q7WUFDRSxJQUFJLEVBQUUsSUFBSTtZQUNWLEtBQUssRUFBRSxJQUFJO1lBQ1gsSUFBSSxFQUFFLE1BQU07WUFDWixVQUFVLEVBQUUsSUFBSTtZQUNoQixRQUFRLEVBQUUsS0FBSztTQUNoQjtRQUNEO1lBQ0UsSUFBSSxFQUFFLE9BQU87WUFDYixLQUFLLEVBQUUsT0FBTztZQUNkLElBQUksRUFBRSxTQUFTO1NBQ2hCO1FBQ0Q7WUFDRSxJQUFJLEVBQUUsU0FBUztZQUNmLEtBQUssRUFBRSxTQUFTO1lBQ2hCLElBQUksRUFBRSxTQUFTO1NBQ2hCO1FBQ0Q7WUFDRSxJQUFJLEVBQUUsY0FBYztZQUNwQixLQUFLLEVBQUUsY0FBYztZQUNyQixJQUFJLEVBQUUsU0FBUztTQUNoQjtRQUNEO1lBQ0UsSUFBSSxFQUFFLGNBQWM7WUFDcEIsS0FBSyxFQUFFLGNBQWM7WUFDckIsSUFBSSxFQUFFLFNBQVM7U0FDaEI7S0FDRjtDQUNGLENBQUMsQ0FBQSJ9