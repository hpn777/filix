"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findValueByKey = findValueByKey;
function findValueByKey(obj, key) {
    let result = null;
    for (const prop in obj) {
        if (prop === key) {
            return obj[prop];
        }
        if (obj[prop] instanceof Object || obj[prop] instanceof Array) {
            result = findValueByKey(obj[prop], key);
            if (result) {
                break;
            }
        }
    }
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZFZhbHVlQnlLZXkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvZmluZFZhbHVlQnlLZXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx3Q0FxQkM7QUFyQkQsU0FBZ0IsY0FBYyxDQUM1QixHQUFnQixFQUNoQixHQUFXO0lBRVgsSUFBSSxNQUFNLEdBQWtCLElBQUksQ0FBQTtJQUVoQyxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLElBQUksSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO1lBQ2pCLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ2xCLENBQUM7UUFFRCxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxNQUFNLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLEtBQUssRUFBRSxDQUFDO1lBQzlELE1BQU0sR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO1lBRXZDLElBQUksTUFBTSxFQUFFLENBQUM7Z0JBQ1gsTUFBSztZQUNQLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVELE9BQU8sTUFBTSxDQUFBO0FBQ2YsQ0FBQyJ9