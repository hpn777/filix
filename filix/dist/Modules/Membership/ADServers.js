"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const collection_1 = require("../../Model/collection");
const logger_1 = require("../../utils/logger");
class ADServers extends collection_1.Collection {
    constructor() {
        super();
    }
    authenticate(username, password, callback) {
        const serverWrapper = this.getActiveServer();
        logger_1.logger.info(`Server wrpapper ${serverWrapper}`, {
            module: 'Membership::ADServers',
        });
        if (!serverWrapper) {
            callback(new Error('No active AD server available'), null);
            return;
        }
        serverWrapper
            .get('server')
            .authenticate(username, password, this.getCallback({ arguments, methodName: 'authenticate' }, serverWrapper, callback));
    }
    findUser(opts, username, includeMembership, callback) {
        const serverWrapper = this.getActiveServer();
        if (!serverWrapper) {
            callback(new Error('No active AD server available'), null);
            return;
        }
        serverWrapper
            .get('server')
            .findUser(opts, username, includeMembership, this.getCallback({ arguments, methodName: 'findUser' }, serverWrapper, callback));
    }
    getUsersForGroup(opts, groupName, callback) {
        const serverWrapper = this.getActiveServer();
        if (!serverWrapper) {
            callback(new Error('No active AD server available'), null);
            return;
        }
        const newCallback = this.getCallback({ arguments, methodName: 'getUsersForGroup' }, serverWrapper, callback);
        const server = serverWrapper.get('server');
        logger_1.logger.info(`server ${server}`, { module: 'Membership::ADServers' });
        server.getUsersForGroup(groupName, newCallback);
    }
    findGroup(opts, groupName, callback) {
        const serverWrapper = this.getActiveServer();
        if (!serverWrapper) {
            callback(new Error('No active AD server available'), null);
            return;
        }
        serverWrapper
            .get('server')
            .findGroup(opts, groupName, this.getCallback({ arguments, methodName: 'findGroup' }, serverWrapper, callback));
    }
    getActiveServer() {
        let adServer = this.find(x => x.get('online'));
        if (adServer) {
            return adServer;
        }
        this.each(x => {
            x.set('online', true);
        });
        adServer = this.find(x => x.get('online'));
        if (adServer) {
            return adServer;
        }
    }
    getCallback(method, server, callback) {
        const acServer = server;
        const callbackFn = callback;
        return (error, response) => {
            if (error) {
                logger_1.logger.error(`AD server error: ${JSON.stringify(error)}`, {
                    module: 'Membership::ADServers',
                });
                if (error.code == 3 ||
                    error.code == 80 ||
                    error.code == 51 ||
                    error.code == 128) {
                    acServer.set('online', false);
                    this[method.methodName].apply(this, method.arguments);
                }
            }
            else {
                acServer.set('online', true);
            }
            callbackFn(error, response);
        };
    }
}
exports.default = ADServers;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQURTZXJ2ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL01vZHVsZXMvTWVtYmVyc2hpcC9BRFNlcnZlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFPQSx1REFBbUQ7QUFDbkQsK0NBQTJDO0FBUTNDLE1BQU0sU0FBVSxTQUFRLHVCQUFVO0lBQ2hDO1FBQ0UsS0FBSyxFQUFFLENBQUE7SUFDVCxDQUFDO0lBVUQsWUFBWSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUTtRQUN2QyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUE7UUFFNUMsZUFBTSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsYUFBYSxFQUFFLEVBQUU7WUFDOUMsTUFBTSxFQUFFLHVCQUF1QjtTQUNoQyxDQUFDLENBQUE7UUFFRixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDbkIsUUFBUSxDQUFDLElBQUksS0FBSyxDQUFDLCtCQUErQixDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUE7WUFDMUQsT0FBTTtRQUNSLENBQUM7UUFFRCxhQUFhO2FBQ1YsR0FBRyxDQUFDLFFBQVEsQ0FBQzthQUNiLFlBQVksQ0FDWCxRQUFRLEVBQ1IsUUFBUSxFQUNSLElBQUksQ0FBQyxXQUFXLENBQ2QsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxFQUN6QyxhQUFhLEVBQ2IsUUFBUSxDQUNULENBQ0YsQ0FBQTtJQUNMLENBQUM7SUFXRCxRQUFRLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxpQkFBaUIsRUFBRSxRQUFRO1FBQ2xELE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQTtRQUU1QyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDbkIsUUFBUSxDQUFDLElBQUksS0FBSyxDQUFDLCtCQUErQixDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUE7WUFDMUQsT0FBTTtRQUNSLENBQUM7UUFFRCxh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