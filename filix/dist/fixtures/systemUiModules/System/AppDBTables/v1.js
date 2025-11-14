"use strict";
;
({
    tableName: 'tables_schema',
    dataProviderId: 'AppDB',
    serviceCommand: 'GetData',
    selectors: [
        {
            columnName: 'name',
            foreignColumnName: 'tableName',
            foreignTableName: 'columns_schema',
        },
    ],
    extensionBar: ['moreContextMenu', 'createModules'],
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidjEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZml4dHVyZXMvc3lzdGVtVWlNb2R1bGVzL1N5c3RlbS9BcHBEQlRhYmxlcy92MS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsQ0FBQztBQUFBLENBQUM7SUFDQSxTQUFTLEVBQUUsZUFBZTtJQUMxQixjQUFjLEVBQUUsT0FBTztJQUN2QixjQUFjLEVBQUUsU0FBUztJQUN6QixTQUFTLEVBQUU7UUFDVDtZQUNFLFVBQVUsRUFBRSxNQUFNO1lBQ2xCLGlCQUFpQixFQUFFLFdBQVc7WUFDOUIsZ0JBQWdCLEVBQUUsZ0JBQWdCO1NBQ25DO0tBQ0Y7SUFFRCxZQUFZLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxlQUFlLENBQUM7Q0FDbkQsQ0FBQyxDQUFBIn0=