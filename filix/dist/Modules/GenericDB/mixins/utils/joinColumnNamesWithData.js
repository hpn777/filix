"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinColumnNamesWithData = joinColumnNamesWithData;
function joinColumnNamesWithData(headers, dataRow) {
    return getColumnsNames(headers).map((columnName, index) => ({
        [columnName]: dataRow[index],
    }));
}
const getColumnsNames = (headers) => headers.map((header) => header.name);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam9pbkNvbHVtbk5hbWVzV2l0aERhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvTW9kdWxlcy9HZW5lcmljREIvbWl4aW5zL3V0aWxzL2pvaW5Db2x1bW5OYW1lc1dpdGhEYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBVUEsMERBSUM7QUFKRCxTQUFnQix1QkFBdUIsQ0FBQyxPQUFpQixFQUFFLE9BQVk7SUFDckUsT0FBTyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBa0IsRUFBRSxLQUFhLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDMUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDO0tBQzdCLENBQUMsQ0FBQyxDQUFBO0FBQ0wsQ0FBQztBQUVELE1BQU0sZUFBZSxHQUFHLENBQUMsT0FBaUIsRUFBWSxFQUFFLENBQ3RELE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFjLEVBQVUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQSJ9