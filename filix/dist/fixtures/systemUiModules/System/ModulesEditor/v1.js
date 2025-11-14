"use strict";
;
({
    dataProviderId: 'AppDB',
    idProperty: 'id',
    tableName: 'module',
    defaultSelect: 'module',
    extensionBar: ['moreContextMenu', 'clearFiltersButton', 'addGenericRow'],
    columns: [
        {
            name: 'owner_id',
            title: 'owner_id',
            type: 'text',
            hidden: true,
        },
        {
            name: 'id',
            title: 'id',
            type: 'id',
            primaryKey: true,
        },
        {
            name: 'name',
            title: 'Name',
            type: 'text',
        },
        {
            name: 'moduleClassName',
            title: 'Class Name',
            type: 'text',
        },
        {
            name: 'moduleType',
            title: 'Type',
            type: 'text',
        },
        {
            name: 'moduleGroup',
            title: 'Group',
            type: 'text',
            hidden: true,
        },
        {
            name: 'config',
            title: 'Config',
            type: 'sourcecode',
            hidden: true,
        },
        {
            name: 'parentId',
            title: 'Parent Id',
            type: 'number',
            hidden: true,
        },
        {
            name: 'description',
            title: 'Description',
            type: 'htmleditor',
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
                    childrenTable: 'module_roles',
                    leftField: 'module_id',
                    rightField: 'roles_id',
                    underlyingColumnName: 'id',
                },
            },
        },
    ],
    initialCommand: 'GetColumnsDefinition',
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidjEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZml4dHVyZXMvc3lzdGVtVWlNb2R1bGVzL1N5c3RlbS9Nb2R1bGVzRWRpdG9yL3YxLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxDQUFDO0FBQUEsQ0FBQztJQUNBLGNBQWMsRUFBRSxPQUFPO0lBQ3ZCLFVBQVUsRUFBRSxJQUFJO0lBQ2hCLFNBQVMsRUFBRSxRQUFRO0lBRW5CLGFBQWEsRUFBRSxRQUFRO0lBQ3ZCLFlBQVksRUFBRSxDQUFDLGlCQUFpQixFQUFFLG9CQUFvQixFQUFFLGVBQWUsQ0FBQztJQUN4RSxPQUFPLEVBQUU7UUFDUDtZQUNFLElBQUksRUFBRSxVQUFVO1lBQ2hCLEtBQUssRUFBRSxVQUFVO1lBQ2pCLElBQUksRUFBRSxNQUFNO1lBQ1osTUFBTSxFQUFFLElBQUk7U0FDYjtRQUNEO1lBQ0UsSUFBSSxFQUFFLElBQUk7WUFDVixLQUFLLEVBQUUsSUFBSTtZQUNYLElBQUksRUFBRSxJQUFJO1lBQ1YsVUFBVSxFQUFFLElBQUk7U0FDakI7UUFDRDtZQUNFLElBQUksRUFBRSxNQUFNO1lBQ1osS0FBSyxFQUFFLE1BQU07WUFDYixJQUFJLEVBQUUsTUFBTTtTQUNiO1FBQ0Q7WUFDRSxJQUFJLEVBQUUsaUJBQWlCO1lBQ3ZCLEtBQUssRUFBRSxZQUFZO1lBQ25CLElBQUksRUFBRSxNQUFNO1NBQ2I7UUFDRDtZQUNFLElBQUksRUFBRSxZQUFZO1lBQ2xCLEtBQUssRUFBRSxNQUFNO1lBQ2IsSUFBSSxFQUFFLE1BQU07U0FDYjtRQUNEO1lBQ0UsSUFBSSxFQUFFLGFBQWE7WUFDbkIsS0FBSyxFQUFFLE9BQU87WUFDZCxJQUFJLEVBQUUsTUFBTTtZQUNaLE1BQU0sRUFBRSxJQUFJO1NBQ2I7UUFDRDtZQUNFLElBQUksRUFBRSxRQUFRO1lBQ2QsS0FBSyxFQUFFLFFBQVE7WUFDZixJQUFJLEVBQUUsWUFBWTtZQUNsQixNQUFNLEVBQUUsSUFBSTtTQUNiO1FBQ0Q7WUFDRSxJQUFJLEVBQUUsVUFBVTtZQUNoQixLQUFLLEVBQUUsV0FBVztZQUNsQixJQUFJLEVBQUUsUUFBUTtZQUNkLE1BQU0sRUFBRSxJQUFJO1NBQ2I7UUFDRDtZQUNFLElBQUksRUFBRSxhQUFhO1lBQ25CLEtBQUssRUFBRSxhQUFhO1lBQ3BCLElBQUksRUFBRSxZQUFZO1NBQ25CO1FBQ0Q7WUFDRSxJQUFJLEVBQUUsT0FBTztZQUNiLEtBQUssRUFBRSxPQUFPO1lBQ2QsSUFBSSxFQUFFLGVBQWU7WUFDckIsS0FBSyxDQUFDLE1BQU07Z0JBQ1YsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQzFCLENBQUM7WUFDRCxXQUFXLEVBQUU7Z0JBQ1gsY0FBYyxFQUFFLE9BQU87Z0JBQ3ZCLGFBQWEsRUFBRSxVQUFVO2dCQUN6QixVQUFVLEVBQUUsSUFBSTtnQkFDaEIsWUFBWSxFQUFFLFVBQVU7Z0JBQ3hCLG9CQUFvQixFQUFFLElBQUk7Z0JBQzFCLElBQUksRUFBRTtvQkFDSixjQUFjLEVBQUUsT0FBTztvQkFDdkIsYUFBYSxFQUFFLGNBQWM7b0JBQzdCLFNBQVMsRUFBRSxXQUFXO29CQUN0QixVQUFVLEVBQUUsVUFBVTtvQkFDdEIsb0JBQW9CLEVBQUUsSUFBSTtpQkFDM0I7YUFDRjtTQUNGO0tBQ0Y7SUFDRCxjQUFjLEVBQUUsc0JBQXNCO0NBQ3ZDLENBQUMsQ0FBQSJ9