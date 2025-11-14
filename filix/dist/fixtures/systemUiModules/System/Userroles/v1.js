"use strict";
;
({
    dataProviderId: 'AppDB',
    idProperty: 'id',
    tableName: 'app_role',
    serviceCommand: 'GetData',
    defaultSelect: 'app_role',
    editable: true,
    deletable: true,
    extensionBar: ['moreContextMenu', 'clearFiltersButton', 'addGenericRow'],
    columns: [
        {
            name: 'id',
            title: 'Id',
            type: 'number',
            primaryKey: true,
            defaultValue: '0',
        },
        {
            name: 'roleName',
            title: 'Name',
            type: 'text',
        },
    ],
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidjEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZml4dHVyZXMvc3lzdGVtVWlNb2R1bGVzL1N5c3RlbS9Vc2Vycm9sZXMvdjEuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLENBQUM7QUFBQSxDQUFDO0lBQ0EsY0FBYyxFQUFFLE9BQU87SUFDdkIsVUFBVSxFQUFFLElBQUk7SUFDaEIsU0FBUyxFQUFFLFVBQVU7SUFDckIsY0FBYyxFQUFFLFNBQVM7SUFDekIsYUFBYSxFQUFFLFVBQVU7SUFDekIsUUFBUSxFQUFFLElBQUk7SUFDZCxTQUFTLEVBQUUsSUFBSTtJQUNmLFlBQVksRUFBRSxDQUFDLGlCQUFpQixFQUFFLG9CQUFvQixFQUFFLGVBQWUsQ0FBQztJQUN4RSxPQUFPLEVBQUU7UUFDUDtZQUNFLElBQUksRUFBRSxJQUFJO1lBQ1YsS0FBSyxFQUFFLElBQUk7WUFDWCxJQUFJLEVBQUUsUUFBUTtZQUNkLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLFlBQVksRUFBRSxHQUFHO1NBQ2xCO1FBQ0Q7WUFDRSxJQUFJLEVBQUUsVUFBVTtZQUNoQixLQUFLLEVBQUUsTUFBTTtZQUNiLElBQUksRUFBRSxNQUFNO1NBQ2I7S0FDRjtDQUNGLENBQUMsQ0FBQSJ9