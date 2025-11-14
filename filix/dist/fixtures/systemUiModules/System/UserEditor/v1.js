"use strict";
;
({
    dataProviderId: 'Membership',
    tableName: 'user_data',
    idProperty: 'id',
    serviceCommand: 'GetUsers',
    saveServiceCommand: 'UpdateUser',
    defaultSelect: 'user_data',
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
        },
        {
            name: 'email',
            title: 'Email',
            type: 'text',
        },
        {
            name: 'config',
            title: 'Config',
            type: 'text',
            hidden: true,
        },
        {
            name: 'displayName',
            title: 'Display Name',
            type: 'text',
        },
        {
            name: 'active',
            title: 'Active',
            type: 'enum',
            enum: ['Disabled', 'Active'],
        },
        {
            name: 'roles',
            title: 'Roles',
            type: 'multiselector',
            value(record) {
                return Number(record.id);
            },
            resolveView: {
                dataProviderId: 'AppDB',
                childrenTable: 'app_role',
                valueField: 'id',
                displayField: 'roleName',
                underlyingColumnName: 'id',
                xref: {
                    dataProviderId: 'AppDB',
                    childrenTable: 'user_roles',
                    leftField: 'user_id',
                    rightField: 'roles_id',
                    underlyingColumnName: 'id',
                },
            },
        },
    ],
    initialCommand: 'GetColumnsDefinition',
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidjEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZml4dHVyZXMvc3lzdGVtVWlNb2R1bGVzL1N5c3RlbS9Vc2VyRWRpdG9yL3YxLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxDQUFDO0FBQUEsQ0FBQztJQUNBLGNBQWMsRUFBRSxZQUFZO0lBQzVCLFNBQVMsRUFBRSxXQUFXO0lBQ3RCLFVBQVUsRUFBRSxJQUFJO0lBQ2hCLGNBQWMsRUFBRSxVQUFVO0lBQzFCLGtCQUFrQixFQUFFLFlBQVk7SUFDaEMsYUFBYSxFQUFFLFdBQVc7SUFDMUIsT0FBTyxFQUFFO1FBQ1A7WUFDRSxJQUFJLEVBQUUsSUFBSTtZQUNWLEtBQUssRUFBRSxJQUFJO1lBQ1gsSUFBSSxFQUFFLFFBQVE7WUFDZCxVQUFVLEVBQUUsSUFBSTtZQUNoQixRQUFRLEVBQUUsS0FBSztZQUNmLEtBQUssRUFBRSxDQUFDO1NBQ1Q7UUFDRDtZQUNFLElBQUksRUFBRSxVQUFVO1lBQ2hCLEtBQUssRUFBRSxXQUFXO1lBQ2xCLElBQUksRUFBRSxNQUFNO1NBQ2I7UUFDRDtZQUNFLElBQUksRUFBRSxPQUFPO1lBQ2IsS0FBSyxFQUFFLE9BQU87WUFDZCxJQUFJLEVBQUUsTUFBTTtTQUNiO1FBQ0Q7WUFDRSxJQUFJLEVBQUUsUUFBUTtZQUNkLEtBQUssRUFBRSxRQUFRO1lBQ2YsSUFBSSxFQUFFLE1BQU07WUFDWixNQUFNLEVBQUUsSUFBSTtTQUNiO1FBQ0Q7WUFDRSxJQUFJLEVBQUUsYUFBYTtZQUNuQixLQUFLLEVBQUUsY0FBYztZQUNyQixJQUFJLEVBQUUsTUFBTTtTQUNiO1FBQ0Q7WUFDRSxJQUFJLEVBQUUsUUFBUTtZQUNkLEtBQUssRUFBRSxRQUFRO1lBQ2YsSUFBSSxFQUFFLE1BQU07WUFDWixJQUFJLEVBQUUsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDO1NBQzdCO1FBQ0Q7WUFDRSxJQUFJLEVBQUUsT0FBTztZQUNiLEtBQUssRUFBRSxPQUFPO1lBQ2QsSUFBSSxFQUFFLGVBQWU7WUFDckIsS0FBSyxDQUFDLE1BQU07Z0JBQ1YsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQzFCLENBQUM7WUFDRCxXQUFXLEVBQUU7Z0JBQ1gsY0FBYyxFQUFFLE9BQU87Z0JBQ3ZCLGFBQWEsRUFBRSxVQUFVO2dCQUN6QixVQUFVLEVBQUUsSUFBSTtnQkFDaEIsWUFBWSxFQUFFLFVBQVU7Z0JBQ3hCLG9CQUFvQixFQUFFLElBQUk7Z0JBQzFCLElBQUksRUFBRTtvQkFDSixjQUFjLEVBQUUsT0FBTztvQkFDdkIsYUFBYSxFQUFFLFlBQVk7b0JBQzNCLFNBQVMsRUFBRSxTQUFTO29CQUNwQixVQUFVLEVBQUUsVUFBVTtvQkFDdEIsb0JBQW9CLEVBQUUsSUFBSTtpQkFDM0I7YUFDRjtTQUNGO0tBQ0Y7SUFDRCxjQUFjLEVBQUUsc0JBQXNCO0NBQ3ZDLENBQUMsQ0FBQSJ9