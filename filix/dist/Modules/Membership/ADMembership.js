"use strict";
const tslib_1 = require("tslib");
const ActiveDirectory = require("activedirectory");
const Enumerable = tslib_1.__importStar(require("linq"));
const tessio_1 = require("tessio");
const model_1 = require("../../Model/model");
const ADServers_1 = tslib_1.__importDefault(require("./ADServers"));
const lookupServers = new ADServers_1.default();
const authenticateServers = new ADServers_1.default();
class ADMembership extends model_1.Model {
    config;
    initialize() {
        this.config = this.get('config');
        tessio_1.lodash.each(this.config.servers, (adServer) => {
            const server = new ActiveDirectory({
                url: adServer.url,
                baseDN: adServer.lookupDN || adServer.baseDN,
                username: adServer.lookupUsername,
                password: adServer.lookupPassword,
            });
            lookupServers.push({
                server,
            });
            authenticateServers.push({
                server: new ActiveDirectory({
                    url: adServer.url,
                    baseDN: adServer.baseDN,
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
    getAllUsers(callback) {
        lookupServers.getUsersForGroup({}, this.config.adGroup || '', (err, users) => {
            callback(err, users);
        });
    }
    getAllRoles(callbackFn) {
        const callback = callbackFn;
        lookupServers.findGroup({}, this.config.adGroup || '', (err, rootGroup) => {
            if (rootGroup && rootGroup.member) {
                const groups = Enumerable.from(rootGroup.member)
                    .select((x) => ({
                    id: x.split(',')[0].split('=')[1],
                }))
                    .toArray();
                callback(groups);
            }
        });
    }
}
module.exports = ADMembership;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQURNZW1iZXJzaGlwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL01vZHVsZXMvTWVtYmVyc2hpcC9BRE1lbWJlcnNoaXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFNQSxtREFBbUQ7QUFDbkQseURBQWtDO0FBQ2xDLG1DQUFvQztBQUVwQyw2Q0FBeUM7QUFDekMsb0VBQW1DO0FBR25DLE1BQU0sYUFBYSxHQUFHLElBQUksbUJBQVMsRUFBRSxDQUFBO0FBQ3JDLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxtQkFBUyxFQUFFLENBQUE7QUFZM0MsTUFBTSxZQUFhLFNBQVEsYUFBSztJQUN0QixNQUFNLENBQWE7SUFNM0IsVUFBVTtRQUNSLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQWUsQ0FBQTtRQUU5QyxlQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsUUFBUSxFQUFFLEVBQUU7WUFDdkMsTUFBTSxNQUFNLEdBQUcsSUFBSSxlQUFlLENBQUM7Z0JBQ2pDLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRztnQkFDakIsTUFBTSxFQUFFLFFBQVEsQ0FBQyxRQUFRLElBQUksUUFBUSxDQUFDLE1BQU07Z0JBQzVDLFFBQVEsRUFBRSxRQUFRLENBQUMsY0FBYztnQkFDakMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxjQUFjO2FBQ2xDLENBQUMsQ0FBQTtZQUVGLGFBQWEsQ0FBQyxJQUFJLENBQUM7Z0JBQ2pCLE1BQU07YUFDUCxDQUFDLENBQUE7WUFFRixtQkFBbUIsQ0FBQyxJQUFJLENBQUM7Z0JBQ3ZCLE1BQU0sRUFBRSxJQUFJLGVBQWUsQ0FBQztvQkFDMUIsR0FBRyxFQUFFLFFBQVEsQ0FBQyxHQUFHO29CQUNqQixNQUFNLEVBQUUsUUFBUSxDQUFDLE1BQU07aUJBQ3hCLENBQUM7YUFDSCxDQUFDLENBQUE7UUFDSixDQUFDLENBQUMsQ0FB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