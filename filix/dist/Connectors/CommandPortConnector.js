"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const net = tslib_1.__importStar(require("net"));
const rxjs_1 = require("rxjs");
const createConnection = (options) => {
    const connection = net.createConnection(options);
    connection.setEncoding('utf8');
    connection.send = (message) => {
        connection.write(`${message}\n`);
    };
    connection.connect$ = new rxjs_1.Observable(observer => {
        connection.on('connect', () => {
            observer.next(true);
        });
    });
    connection.error$ = new rxjs_1.Observable(observer => {
        connection.on('error', (error) => {
            observer.next(error);
        });
    });
    connection.data$ = new rxjs_1.Observable(observer => {
        connection.on('data', (data) => {
            data = data.replace(/#(?:[a-z][a-z0-9_]*)\@.*?\([0-9]*\)\:/, '');
            observer.next(data);
        });
        connection.on('close', () => {
            observer.complete();
        });
    });
    return connection;
};
const CommandPortConnector = (config) => {
    return new Promise(resolve => {
        const connection = createConnection(config);
        connection.connect$.subscribe(() => {
            resolve(connection);
        });
    });
};
exports.default = CommandPortConnector;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbWFuZFBvcnRDb25uZWN0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvQ29ubmVjdG9ycy9Db21tYW5kUG9ydENvbm5lY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpREFBMEI7QUFDMUIsK0JBQWlDO0FBY2pDLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxPQUEwQixFQUFjLEVBQUU7SUFDbEUsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBZSxDQUFBO0lBQzlELFVBQVUsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUE7SUFFOUIsVUFBVSxDQUFDLElBQUksR0FBRyxDQUFDLE9BQWUsRUFBRSxFQUFFO1FBQ3BDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFPLElBQUksQ0FBQyxDQUFBO0lBQ2xDLENBQUMsQ0FBQTtJQUVELFVBQVUsQ0FBQyxRQUFRLEdBQUcsSUFBSSxpQkFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1FBQzlDLFVBQVUsQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRTtZQUM1QixRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ3JCLENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQyxDQUFDLENBQUE7SUFFRixVQUFVLENBQUMsTUFBTSxHQUFHLElBQUksaUJBQVUsQ0FBQyxRQUFRLENBQUMsRUFBRTtRQUM1QyxVQUFVLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQVksRUFBRSxFQUFFO1lBQ3RDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDdEIsQ0FBQyxDQUFDLENBQUE7SUFDSixDQUFDLENBQUMsQ0FBQTtJQUVGLFVBQVUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxpQkFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1FBQzNDLFVBQVUsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBWSxFQUFFLEVBQUU7WUFDckMsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsdUNBQXVDLEVBQUUsRUFBRSxDQUFDLENBQUE7WUFDaEUsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUNyQixDQUFDLENBQUMsQ0FBQTtRQUVGLFVBQVUsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtZQUMxQixRQUFRLENBQUMsUUFBUSxFQUFFLENBQUE7UUFDckIsQ0FBQyxDQUFDLENBQUE7SUFDSixDQUFDLENBQUMsQ0FBQTtJQUVGLE9BQU8sVUFBVSxDQUFBO0FBQ25CLENBQUMsQ0FBQTtBQUVELE1BQU0sb0JBQW9CLEdBQUcsQ0FDM0IsTUFBeUIsRUFDSixFQUFFO0lBQ3ZCLE9BQU8sSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7UUFDM0IsTUFBTSxVQUFVLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUE7UUFFM0MsVUFBVSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFO1lBQ2pDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUNyQixDQUFDLENBQUMsQ0FBQTtJQUNKLENBQUMsQ0FBQyxDQUFBO0FBQ0osQ0FBQyxDQUFBO0FBRUQsa0JBQWUsb0JBQW9CLENBQUEifQ==