"use strict";
;
({
    dataProviderId: 'Membership',
    idProperty: 'id',
    tableName: 'user_data',
    serviceCommand: 'GetUsers',
    saveServiceCommand: 'UpdateUser',
    removeServiceCommand: 'RemoveUser',
    defaultSelect: 'user_data',
    editable: true,
    deletable: true,
    extensionBar: ['moreContextMenu', 'clearFiltersButton', 'addGenericRow'],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidjEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZml4dHVyZXMvc3lzdGVtVWlNb2R1bGVzL1N5c3RlbS9Vc2Vycy92MS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsQ0FBQztBQUFBLENBQUM7SUFDQSxjQUFjLEVBQUUsWUFBWTtJQUM1QixVQUFVLEVBQUUsSUFBSTtJQUNoQixTQUFTLEVBQUUsV0FBVztJQUN0QixjQUFjLEVBQUUsVUFBVTtJQUMxQixrQkFBa0IsRUFBRSxZQUFZO0lBQ2hDLG9CQUFvQixFQUFFLFlBQVk7SUFDbEMsYUFBYSxFQUFFLFdBQVc7SUFDMUIsUUFBUSxFQUFFLElBQUk7SUFDZCxTQUFTLEVBQUUsSUFBSTtJQUNmLFlBQVksRUFBRSxDQUFDLGlCQUFpQixFQUFFLG9CQUFvQixFQUFFLGVBQWUsQ0FBQztJQUN4RSxPQUFPLEVBQUU7UUFDUDtZQUNFLElBQUksRUFBRSxJQUFJO1lBQ1YsS0FBSyxFQUFFLElBQUk7WUFDWCxJQUFJLEVBQUUsUUFBUTtZQUNkLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLFFBQVEsRUFBRSxLQUFLO1lBQ2YsS0FBSyxFQUFFLENBQUM7U0FDVDtRQUNEO1lBQ0UsSUFBSSxFQUFFLFVBQVU7WUFDaEIsS0FBSyxFQUFFLFdBQVc7WUFDbEIsSUFBSSxFQUFFLE1BQU07WUFDWixVQUFVLEVBQUUsS0FBSztTQUNsQjtRQUNEO1lBQ0UsSUFBSSxFQUFFLE9BQU87WUFDYixLQUFLLEVBQUUsT0FBTztZQUNkLElBQUksRUFBRSxNQUFNO1NBQ2I7UUFDRDtZQUNFLElBQUksRUFBRSxhQUFhO1lBQ25CLEtBQUssRUFBRSxhQUFhO1lBQ3BCLElBQUksRUFBRSxNQUFNO1NBQ2I7UUFDRDtZQUNFLElBQUksRUFBRSxRQUFRO1lBQ2QsS0FBSyxFQUFFLFFBQVE7WUFDZixJQUFJLEVBQUUsU0FBUztZQUNmLFVBQVUsRUFBRSxLQUFLO1NBQ2xCO0tBQ0Y7Q0FDRixDQUFDLENBQUEifQ==