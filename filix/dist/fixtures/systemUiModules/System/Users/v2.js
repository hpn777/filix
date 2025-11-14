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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidjIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZml4dHVyZXMvc3lzdGVtVWlNb2R1bGVzL1N5c3RlbS9Vc2Vycy92Mi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsQ0FBQztBQUFBLENBQUM7SUFDQSxjQUFjLEVBQUUsWUFBWTtJQUM1QixVQUFVLEVBQUUsSUFBSTtJQUNoQixTQUFTLEVBQUUsV0FBVztJQUN0QixjQUFjLEVBQUUsVUFBVTtJQUMxQixrQkFBa0IsRUFBRSxZQUFZO0lBQ2hDLGFBQWEsRUFBRSxXQUFXO0lBQzFCLFFBQVEsRUFBRSxJQUFJO0lBQ2QsU0FBUyxFQUFFLEtBQUs7SUFDaEIsWUFBWSxFQUFFLENBQUMsaUJBQWlCLEVBQUUsb0JBQW9CLEVBQUUsZUFBZSxDQUFDO0lBQ3hFLE9BQU8sRUFBRTtRQUNQO1lBQ0UsSUFBSSxFQUFFLElBQUk7WUFDVixLQUFLLEVBQUUsSUFBSTtZQUNYLElBQUksRUFBRSxRQUFRO1lBQ2QsVUFBVSxFQUFFLElBQUk7WUFDaEIsUUFBUSxFQUFFLEtBQUs7WUFDZixLQUFLLEVBQUUsQ0FBQztTQUNUO1FBQ0Q7WUFDRSxJQUFJLEVBQUUsVUFBVTtZQUNoQixLQUFLLEVBQUUsV0FBVztZQUNsQixJQUFJLEVBQUUsTUFBTTtZQUNaLFVBQVUsRUFBRSxLQUFLO1NBQ2xCO1FBQ0Q7WUFDRSxJQUFJLEVBQUUsT0FBTztZQUNiLEtBQUssRUFBRSxPQUFPO1lBQ2QsSUFBSSxFQUFFLE1BQU07U0FDYjtRQUNEO1lBQ0UsSUFBSSxFQUFFLGFBQWE7WUFDbkIsS0FBSyxFQUFFLGFBQWE7WUFDcEIsSUFBSSxFQUFFLE1BQU07U0FDYjtRQUNEO1lBQ0UsSUFBSSxFQUFFLFFBQVE7WUFDZCxLQUFLLEVBQUUsUUFBUTtZQUNmLElBQUksRUFBRSxTQUFTO1lBQ2YsVUFBVSxFQUFFLEtBQUs7U0FDbEI7S0FDRjtDQUNGLENBQUMsQ0FBQSJ9