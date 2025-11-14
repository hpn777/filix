"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetColumnsDefinition = void 0;
const tslib_1 = require("tslib");
const filterOutDeletedAndOwned_1 = tslib_1.__importDefault(require("./utils/filterOutDeletedAndOwned"));
class GetColumnsDefinition {
    GetColumnsDefinition(request, subscription) {
        const { query } = request.parameters;
        const { tableName } = request.parameters;
        let simpleHeader;
        if (query) {
            const session = this.evH.createSession(query, true);
            simpleHeader = session.getSimpleHeader();
        }
        else if (tableName) {
            const tesseract = this.evH.get(tableName);
            if (tesseract) {
                simpleHeader = tesseract.getSimpleHeader(true);
            }
        }
        simpleHeader = simpleHeader?.filter(filterOutDeletedAndOwned_1.default) ?? [];
        if (simpleHeader) {
            subscription.publish({
                header: simpleHeader,
                type: 'reset',
            }, request.requestId);
        }
        else {
            subscription.publishError({ message: `Dataset: "${tableName || query?.table}" dosn't exist.` }, request.requestId);
        }
    }
}
exports.GetColumnsDefinition = GetColumnsDefinition;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0Q29sdW1uc0RlZmluaXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvTW9kdWxlcy9HZW5lcmljREIvbWl4aW5zL2dldENvbHVtbnNEZWZpbml0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFDQSx3R0FBdUU7QUFFdkUsTUFBYSxvQkFBb0I7SUFDL0Isb0JBQW9CLENBQWtCLE9BQU8sRUFBRSxZQUFZO1FBQ3pELE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFBO1FBQ3BDLE1BQU0sRUFBRSxTQUFTLEVBQUUsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFBO1FBQ3hDLElBQUksWUFBWSxDQUFBO1FBRWhCLElBQUksS0FBSyxFQUFFLENBQUM7WUFDVixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUE7WUFDbkQsWUFBWSxHQUFHLE9BQU8sQ0FBQyxlQUFlLEVBQUUsQ0FBQTtRQUMxQyxDQUFDO2FBQU0sSUFBSSxTQUFTLEVBQUUsQ0FBQztZQUNyQixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQTtZQUN6QyxJQUFJLFNBQVMsRUFBRSxDQUFDO2dCQUNkLFlBQVksR0FBRyxTQUFTLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFBO1lBQ2hELENBQUM7UUFDSCxDQUFDO1FBRUQsWUFBWSxHQUFHLFlBQVksRUFBRSxNQUFNLENBQUMsa0NBQXdCLENBQUMsSUFBSSxFQUFFLENBQUE7UUFDbkUsSUFBSSxZQUFZLEVBQUUsQ0FBQztZQUNqQixZQUFZLENBQUMsT0FBTyxDQUNsQjtnQkFDRSxNQUFNLEVBQUUsWUFBWTtnQkFDcEIsSUFBSSxFQUFFLE9BQU87YUFDZCxFQUNELE9BQU8sQ0FBQyxTQUFTLENBQ2xCLENBQUE7UUFDSCxDQUFDO2FBQU0sQ0FBQztZQUNOLFlBQVksQ0FBQyxZQUFZLENBQ3ZCLEVBQUUsT0FBTyxFQUFFLGFBQWEsU0FBUyxJQUFJLEtBQUssRUFBRSxLQUFLLGlCQUFpQixFQUFFLEVBQ3BFLE9BQU8sQ0FBQyxTQUFTLENBQ2xCLENBQUE7UUFDSCxDQUFDO0lBQ0gsQ0FBQztDQUNGO0FBaENELG9EQWdDQyJ9