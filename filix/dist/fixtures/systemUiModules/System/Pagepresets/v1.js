"use strict";
;
({
    dataProviderId: 'AppDB',
    idProperty: 'id',
    tableName: 'tab_preset',
    serviceCommand: 'GetData',
    defaultSelect: 'tab_preset',
    selectors: [
        {
            name: 'id',
            foreignTableName: 'control_preset',
            foreignColumnName: 'tabPresetId',
        },
    ],
    editable: true,
    deletable: true,
    extensionBar: [
        'moreContextMenu',
        'clearFiltersButton',
        'addGenericRow',
        'removeSelected',
    ],
    columns: [
        {
            name: 'typeId',
            title: 'Type',
            type: 'number',
            resolveView: {
                dataProviderId: 'AppDB',
                childrenTable: 'tab_type',
                valueField: 'id',
                displayField: 'name',
                addBlank: true,
            },
        },
        {
            name: 'userId',
            title: 'User Name',
            type: 'number',
            resolveView: {
                dataProviderId: 'AppDB',
                childrenTable: 'app_role',
                valueField: 'id',
                displayField: 'userName',
                addBlank: true,
            },
        },
        {
            name: 'id',
            title: 'Id',
            type: 'id',
        },
        {
            name: 'name',
            title: 'Name',
            type: 'text',
        },
        {
            name: 'config',
            title: 'Config',
            type: 'text',
            hidden: true,
        },
        {
            name: 'parentId',
            title: 'Parent',
            type: 'text',
            hidden: true,
        },
    ],
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidjEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZml4dHVyZXMvc3lzdGVtVWlNb2R1bGVzL1N5c3RlbS9QYWdlcHJlc2V0cy92MS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsQ0FBQztBQUFBLENBQUM7SUFDQSxjQUFjLEVBQUUsT0FBTztJQUN2QixVQUFVLEVBQUUsSUFBSTtJQUNoQixTQUFTLEVBQUUsWUFBWTtJQUN2QixjQUFjLEVBQUUsU0FBUztJQUN6QixhQUFhLEVBQUUsWUFBWTtJQUMzQixTQUFTLEVBQUU7UUFDVDtZQUNFLElBQUksRUFBRSxJQUFJO1lBQ1YsZ0JBQWdCLEVBQUUsZ0JBQWdCO1lBQ2xDLGlCQUFpQixFQUFFLGFBQWE7U0FDakM7S0FDRjtJQUNELFFBQVEsRUFBRSxJQUFJO0lBQ2QsU0FBUyxFQUFFLElBQUk7SUFDZixZQUFZLEVBQUU7UUFDWixpQkFBaUI7UUFDakIsb0JBQW9CO1FBQ3BCLGVBQWU7UUFDZixnQkFBZ0I7S0FDakI7SUFDRCxPQUFPLEVBQUU7UUFDUDtZQUNFLElBQUksRUFBRSxRQUFRO1lBQ2QsS0FBSyxFQUFFLE1BQU07WUFDYixJQUFJLEVBQUUsUUFBUTtZQUNkLFdBQVcsRUFBRTtnQkFDWCxjQUFjLEVBQUUsT0FBTztnQkFDdkIsYUFBYSxFQUFFLFVBQVU7Z0JBQ3pCLFVBQVUsRUFBRSxJQUFJO2dCQUNoQixZQUFZLEVBQUUsTUFBTTtnQkFDcEIsUUFBUSxFQUFFLElBQUk7YUFDZjtTQUNGO1FBQ0Q7WUFDRSxJQUFJLEVBQUUsUUFBUTtZQUNkLEtBQUssRUFBRSxXQUFXO1lBQ2xCLElBQUksRUFBRSxRQUFRO1lBQ2QsV0FBVyxFQUFFO2dCQUNYLGNBQWMsRUFBRSxPQUFPO2dCQUN2QixhQUFhLEVBQUUsVUFBVTtnQkFDekIsVUFBVSxFQUFFLElBQUk7Z0JBQ2hCLFlBQVksRUFBRSxVQUFVO2dCQUN4QixRQUFRLEVBQUUsSUFBSTthQUNmO1NBQ0Y7UUFDRDtZQUNFLElBQUksRUFBRSxJQUFJO1lBQ1YsS0FBSyxFQUFFLElBQUk7WUFDWCxJQUFJLEVBQUUsSUFBSTtTQUNYO1FBQ0Q7WUFDRSxJQUFJLEVBQUUsTUFBTTtZQUNaLEtBQUssRUFBRSxNQUFNO1lBQ2IsSUFBSSxFQUFFLE1BQU07U0FDYjtRQUNEO1lBQ0UsSUFBSSxFQUFFLFFBQVE7WUFDZCxLQUFLLEVBQUUsUUFBUTtZQUNmLElBQUksRUFBRSxNQUFNO1lBQ1osTUFBTSxFQUFFLElBQUk7U0FDYjtRQUNEO1lBQ0UsSUFBSSxFQUFFLFVBQVU7WUFDaEIsS0FBSyxFQUFFLFFBQVE7WUFDZixJQUFJLEVBQUUsTUFBTTtZQUNaLE1BQU0sRUFBRSxJQUFJO1NBQ2I7S0FDRjtDQUNGLENBQUMsQ0FBQSJ9