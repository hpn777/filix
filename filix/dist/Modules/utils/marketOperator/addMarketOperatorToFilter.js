"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMarketOperatorToFilter = addMarketOperatorToFilter;
const getMarketOperatorFilter_1 = require("./getMarketOperatorFilter");
function addMarketOperatorToFilter(filterOrFilters, marketOperatorId, marketOperatorIdColumnName = 'marketOperatorId') {
    const marketOperatorFilter = (0, getMarketOperatorFilter_1.getMarketOperatorFilter)(marketOperatorId, marketOperatorIdColumnName);
    if (marketOperatorFilter) {
        return Array.isArray(filterOrFilters)
            ? [marketOperatorFilter, ...filterOrFilters]
            : [marketOperatorFilter];
    }
    return Array.isArray(filterOrFilters) ? filterOrFilters : [filterOrFilters];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkTWFya2V0T3BlcmF0b3JUb0ZpbHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9Nb2R1bGVzL3V0aWxzL21hcmtldE9wZXJhdG9yL2FkZE1hcmtldE9wZXJhdG9yVG9GaWx0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFLQSw4REFtQkM7QUFyQkQsdUVBQW1FO0FBRW5FLFNBQWdCLHlCQUF5QixDQUd2QyxlQUF3QyxFQUN4QyxnQkFBd0IsRUFDeEIsNkJBQXVELGtCQUE4QztJQUVyRyxNQUFNLG9CQUFvQixHQUFxQixJQUFBLGlEQUF1QixFQUNwRSxnQkFBZ0IsRUFDaEIsMEJBQTBCLENBQzNCLENBQUE7SUFFRCxJQUFJLG9CQUFvQixFQUFFLENBQUM7UUFDekIsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQztZQUNuQyxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxHQUFHLGVBQWUsQ0FBQztZQUM1QyxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO0lBQzVCLENBQUM7SUFFRCxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQTtBQUM3RSxDQUFDIn0=