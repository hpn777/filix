"use strict";
const tslib_1 = require("tslib");
const tessio_1 = require("tessio");
const ADServers_1 = tslib_1.__importDefault(require("./ADServers"));
const LdapClient_1 = tslib_1.__importDefault(require("./LdapClient/LdapClient"));
const model_1 = require("../../Model/model");
const lookupServers = new ADServers_1.default();
const authenticateServers = new ADServers_1.default();
class OpenLdapMembership extends model_1.Model {
    config;
    initialize() {
        this.config = this.get('config');
        tessio_1.lodash.each(this.config.servers, (adServer) => {
            lookupServers.push({
                server: new LdapClient_1.default({
                    url: adServer.url,
                    baseDN: adServer.baseDN,
                    username: adServer.lookupUsername,
                    password: adServer.lookupPassword,
                    group: adServer.adGroup,
                }),
            });
            authenticateServers.push({
                server: new LdapClient_1.default({
                    url: adServer.url,
                    baseDN: adServer.baseDN,
                    username: adServer.lookupUsername,
                    password: adServer.lookupPassword,
                }),
            });
        });
    }
    login(userName, password, callbackFn) {
        const callback = callbackFn;
        const name = userName;
        const pass = password;
        authenticateServers.authenticate(name, pass, (err, auth) => {
            if (err) {
                err.category = 'AUTH_ERROR';
                err.message = err.name || err.message;
            }
            else if (!auth) {
                err = {
                    category: 'AUTH_ERROR',
                    message: 'Invalid credentials',
                };
            }
            callback(err, auth);
        });
    }
    getUser(userName, callbackFn) {
        const callback = callbackFn;
        lookupServers.findUser({}, userName, false, (err, users) => {
            callback(err, users);
        });
    }
    getAllUsers(callbackFn) {
        lookupServers.getUsersForGroup({}, this.config.adGroup || '', (err, users) => {
            if (err) {
                console.log('OpenLDAP membership error:', err);
            }
            callbackFn(err, users);
        });
    }
}
module.exports = OpenLdapMembership;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3BlbkxkYXBNZW1iZXJzaGlwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL01vZHVsZXMvTWVtYmVyc2hpcC9PcGVuTGRhcE1lbWJlcnNoaXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFNQSxtQ0FBb0M7QUFFcEMsb0VBQW1DO0FBQ25DLGlGQUFnRDtBQUNoRCw2Q0FBeUM7QUFHekMsTUFBTSxhQUFhLEdBQUcsSUFBSSxtQkFBUyxFQUFFLENBQUE7QUFDckMsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLG1CQUFTLEVBQUUsQ0FBQTtBQVEzQyxNQUFNLGtCQUFtQixTQUFRLGFBQUs7SUFDNUIsTUFBTSxDQUFhO0lBTTNCLFVBQVU7UUFDUixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFlLENBQUE7UUFHOUMsZUFBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsRUFBRSxFQUFFO1lBQ3ZDLGFBQWEsQ0FBQyxJQUFJLENBQUM7Z0JBQ2pCLE1BQU0sRUFBRSxJQUFJLG9CQUFVLENBQUM7b0JBQ3JCLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRztvQkFDakIsTUFBTSxFQUFFLFFBQVEsQ0FBQyxNQUFNO29CQUN2QixRQUFRLEVBQUUsUUFBUSxDQUFDLGNBQWM7b0JBQ2pDLFFBQVEsRUFBRSxRQUFRLENBQUMsY0FBYztvQkFDakMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxPQUFPO2lCQUN4QixDQUFDO2FBQ0gsQ0FBQyxDQUFBO1lBRUYsbUJBQW1CLENBQUMsSUFBSSxDQUFDO2dCQUN2QixNQUFNLEVBQUUsSUFBSSxvQkFBVSxDQUFDO29CQUNyQixHQUFHLEVBQUUsUUFBUSxDQUFDLEdBQUc7b0JBQ2pCLE1BQU0sRUFBRSxRQUFRLENBQUMsTUFBTTtvQkFDdkIsUUFBUSxFQUFFLFFBQVEsQ0FBQyxjQUFjO29CQUNqQyxRQUFRLEVBQUUsUUFBUSxDQUFDLGNBQWM7aUJBQ2xDLENBQUM7YUFDSCxDQUFDLENBQUE7UUFDSixDQUFDLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFTRCxLQUFLLENBQ0gsUUFBZ0IsRUFDaEIsUUFBZ0IsRUFDaEIsVUFBK0I7UUFFL0IsTUFBTSxRQUFRLEdBQUcsVUFBVSxDQUFBO1FBQzNCLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQTtRQUNyQixNQUFNLElBQUksR0FBRyxRQUFRLENBQUE7UUFFckIsbUJBQW1CLENBQUMsWUFBWSxDQUM5QixJQUFJLEVBQ0osSUFBSSxFQUNKLENBQUMsR0FBUSxFQUFFLElBQWEsRUFBRSxFQUFFO1lBQzFCLElBQUksR0FBRyxFQUFFLENBQUM7Z0JBQ1IsR0FBRyxDQUFDLFFBQVEsR0FBRyxZQUFZLENBQUE7Z0JBQzNCLEdBQUcsQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFBO1lBQ3ZDLENBQUM7aUJBQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNqQixHQUFHLEdBQUc7b0JBQ0osUUFBUSxFQUFFLFlBQVk7b0JBQ3RCLE9BQU8sRUFBRSxxQkFBcUI7aUJBQy9CLENBQUE7WUFDSCxDQUFDO1lBQ0QsUUFBUSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQTtRQUNyQixDQUFDLENBQ0YsQ0FBQTtJQUNILENBQUM7SUFRRCxPQUFPLENBQUMsUUFBZ0IsRUFBRSxVQUE4QjtRQUN0RCxNQUFNLFFBQVEsR0FBRyxVQUFVLENBQUE7UUFDM0IsYUFBYSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxDQUFDLEdBQVEsRUFBRSxLQUFhLEVBQUUsRUFBRTtZQUN0RSxRQUFRLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFBO1FBQ3RCLENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQU9ELFdBQVcsQ0FBQyxVQUFnQztRQUMxQyxhQUFhLENBQUMsZ0JBQWdCLENBQzVCLEVBQUUsRUFDRixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sSUFBSSxFQUFFLEVBQ3pCLENBQUMsR0FBUSxFQUFFLEtBQWUsRUFBRSxFQUFFO1lBQzVCLElBQUksR0FBRyxFQUFFLENBQUM7Z0JBQ1IsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsRUFBRSxHQUFHLENBQUMsQ0FBQTtZQUNoRCxDQUFDO1lBQ0QsVUFBVSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQTtRQUN4QixDQUFDLENBQ0YsQ0FBQTtJQUNILENBQUM7Q0FDRjtBQUVELGlCQUFTLGtCQUFrQixDQUFBIn0=