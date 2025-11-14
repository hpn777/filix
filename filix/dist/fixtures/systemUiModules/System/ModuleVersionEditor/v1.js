"use strict";
;
({
    dataProviderId: 'AppDB',
    idProperty: 'id',
    tableName: 'module_version',
    serviceCommand: 'GetData',
    defaultSelect: 'module_version',
    extensionBar: ['moreContextMenu', 'clearFiltersButton', 'addGenericRow'],
    columns: [
        {
            name: 'id',
            title: 'Id',
            type: 'number',
            primaryKey: true,
        },
        {
            name: 'moduleId',
            title: 'Module Id',
            type: 'number',
            editable: false,
        },
        {
            name: 'config',
            title: 'Config',
            type: 'sourcecode',
        },
    ],
    initialCommand: 'GetColumnsDefinition',
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidjEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZml4dHVyZXMvc3lzdGVtVWlNb2R1bGVzL1N5c3RlbS9Nb2R1bGVWZXJzaW9uRWRpdG9yL3YxLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxDQUFDO0FBQUEsQ0FBQztJQUNBLGNBQWMsRUFBRSxPQUFPO0lBQ3ZCLFVBQVUsRUFBRSxJQUFJO0lBQ2hCLFNBQVMsRUFBRSxnQkFBZ0I7SUFDM0IsY0FBYyxFQUFFLFNBQVM7SUFDekIsYUFBYSxFQUFFLGdCQUFnQjtJQUMvQixZQUFZLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxvQkFBb0IsRUFBRSxlQUFlLENBQUM7SUFDeEUsT0FBTyxFQUFFO1FBQ1A7WUFDRSxJQUFJLEVBQUUsSUFBSTtZQUNWLEtBQUssRUFBRSxJQUFJO1lBQ1gsSUFBSSxFQUFFLFFBQVE7WUFDZCxVQUFVLEVBQUUsSUFBSTtTQUNqQjtRQUNEO1lBQ0UsSUFBSSxFQUFFLFVBQVU7WUFDaEIsS0FBSyxFQUFFLFdBQVc7WUFDbEIsSUFBSSxFQUFFLFFBQVE7WUFDZCxRQUFRLEVBQUUsS0FBSztTQUNoQjtRQUNEO1lBQ0UsSUFBSSxFQUFFLFFBQVE7WUFDZCxLQUFLLEVBQUUsUUFBUTtZQUNmLElBQUksRUFBRSxZQUFZO1NBQ25CO0tBQ0Y7SUFDRCxjQUFjLEVBQUUsc0JBQXNCO0NBQ3ZDLENBQUMsQ0FBQSJ9