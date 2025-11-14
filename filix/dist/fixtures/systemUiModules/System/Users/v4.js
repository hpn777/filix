"use strict";
;
({
    dataProviderId: 'Membership',
    idProperty: 'id',
    tableName: 'user_data',
    serviceCommand: 'GetUsers',
    saveServiceCommand: 'UpdateUser',
    defaultSelect: 'user_data',
    editable: true,
    deletable: false,
    extensionBar: [
        'moreContextMenu',
        'clearFiltersButton',
        'addGenericRow',
        'removeSelected',
    ],
    columns: [
        {
            name: 'id',
            title: 'Id',
            type: 'number',
            primaryKey: true,
            editable: false,
            order: 1,
        },
        {
            name: 'userName',
            title: 'User Name',
            type: 'text',
            allowBlank: false,
        },
        {
            name: 'email',
            title: 'email',
            type: 'text',
        },
        {
            name: 'displayName',
            title: 'displayName',
            type: 'text',
        },
        {
            name: 'active',
            title: 'active',
            type: 'boolean',
            allowBlank: false,
        },
    ],
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidjQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZml4dHVyZXMvc3lzdGVtVWlNb2R1bGVzL1N5c3RlbS9Vc2Vycy92NC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsQ0FBQztBQUFBLENBQUM7SUFDQSxjQUFjLEVBQUUsWUFBWTtJQUM1QixVQUFVLEVBQUUsSUFBSTtJQUNoQixTQUFTLEVBQUUsV0FBVztJQUN0QixjQUFjLEVBQUUsVUFBVTtJQUMxQixrQkFBa0IsRUFBRSxZQUFZO0lBQ2hDLGFBQWEsRUFBRSxXQUFXO0lBQzFCLFFBQVEsRUFBRSxJQUFJO0lBQ2QsU0FBUyxFQUFFLEtBQUs7SUFDaEIsWUFBWSxFQUFFO1FBQ1osaUJBQWlCO1FBQ2pCLG9CQUFvQjtRQUNwQixlQUFlO1FBQ2YsZ0JBQWdCO0tBQ2pCO0lBQ0QsT0FBTyxFQUFFO1FBQ1A7WUFDRSxJQUFJLEVBQUUsSUFBSTtZQUNWLEtBQUssRUFBRSxJQUFJO1lBQ1gsSUFBSSxFQUFFLFFBQVE7WUFDZCxVQUFVLEVBQUUsSUFBSTtZQUNoQixRQUFRLEVBQUUsS0FBSztZQUNmLEtBQUssRUFBRSxDQUFDO1NBQ1Q7UUFDRDtZQUNFLElBQUksRUFBRSxVQUFVO1lBQ2hCLEtBQUssRUFBRSxXQUFXO1lBQ2xCLElBQUksRUFBRSxNQUFNO1lBQ1osVUFBVSxFQUFFLEtBQUs7U0FDbEI7UUFDRDtZQUNFLElBQUksRUFBRSxPQUFPO1lBQ2IsS0FBSyxFQUFFLE9BQU87WUFDZCxJQUFJLEVBQUUsTUFBTTtTQUNiO1FBQ0Q7WUFDRSxJQUFJLEVBQUUsYUFBYTtZQUNuQixLQUFLLEVBQUUsYUFBYTtZQUNwQixJQUFJLEVBQUUsTUFBTTtTQUNiO1FBQ0Q7WUFDRSxJQUFJLEVBQUUsUUFBUTtZQUNkLEtBQUssRUFBRSxRQUFRO1lBQ2YsSUFBSSxFQUFFLFNBQVM7WUFDZixVQUFVLEVBQUUsS0FBSztTQUNsQjtLQUNGO0NBQ0YsQ0FBQyxDQUFBIn0=