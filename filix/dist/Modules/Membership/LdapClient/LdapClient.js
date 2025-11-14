"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LdapClient = void 0;
const tslib_1 = require("tslib");
const events_1 = require("events");
const ldap = tslib_1.__importStar(require("ldapjs"));
const async = tslib_1.__importStar(require("async"));
const _ = tslib_1.__importStar(require("lodash"));
const Group_1 = tslib_1.__importDefault(require("./models/Group"));
const User_1 = tslib_1.__importDefault(require("./models/User"));
const RangeRetrievalSpecifierAttribute_1 = tslib_1.__importDefault(require("./RangeRetrievalSpecifierAttribute"));
class LdapClient extends events_1.EventEmitter {
    opts;
    constructor(config) {
        super();
        this.opts = config;
    }
    createClient() {
        return ldap.createClient({
            url: this.opts.url,
            reconnect: true
        });
    }
    search(opts, callback) {
        const client = this.createClient();
        client.on('error', (err) => {
            if ((err || {}).errno !== 'ECONNRESET') {
                this.emit('error', err);
            }
        });
        const results = [];
        const onSearchEntry = (entry) => {
            const result = entry.object;
            delete result.controls;
            this.parseRangeAttributes(result, opts, (err, item) => {
                if (err)
                    item = result;
                results.push(item || result);
            });
        };
        const onSearchError = (err) => {
            this.emit('error', err);
            if (callback)
                callback(err);
        };
        const onSearchEnd = () => {
            client.unbind();
            if (callback)
                callback(null, results);
        };
        client.bind(this.opts.username, this.opts.password, (err) => {
            if (err) {
                console.log('err', err);
            }
            const searchOpts = {
                filter: opts.filter,
                scope: opts.scope,
                attributes: opts.attributes,
                sizeLimit: opts.sizeLimit,
                timeLimit: opts.timeLimit,
            };
            client.search(this.opts.baseDN, searchOpts, (err, res) => {
                if (err) {
                    if (callback)
                        callback(err);
                    return;
                }
                res.on('searchEntry', onSearchEntry);
                res.on('error', onSearchError);
                res.on('end', onSearchEnd);
            });
        });
    }
    parseRangeAttributes(result, opts, callback) {
        if (!RangeRetrievalSpecifierAttribute_1.default.hasRangeAttributes(result)) {
            callback(null, result);
            return;
        }
        const rangeAttributes = RangeRetrievalSpecifierAttribute_1.default.getRangeAttributes(result);
        if (!rangeAttributes || rangeAttributes.length <= 0) {
            callback(null, result);
            return;
        }
        const queryAttributes = [];
        rangeAttributes.forEach(rangeAttribute => {
            const attrName = rangeAttribute.attributeName;
            const rangeAttrName = rangeAttribute.toString();
            if (!result[attrName]) {
                result[attrName] = [];
            }
            if (Array.isArray(result[attrName]) && Array.isArray(result[rangeAttrName])) {
                result[attrName].push(...result[rangeAttrName]);
            }
            delete result[rangeAttrName];
            const queryAttribute = rangeAttribute.next();
            if (queryAttribute) {
                queryAttributes.push(queryAttribute.toString());
            }
        });
        if (queryAttributes.length <= 0) {
            callback(null, result);
            return;
        }
        const newOpts = { ...opts, attributes: queryAttributes };
        this.search(newOpts, (err, results) => {
            if (err) {
                if (callback)
                    callback(err);
                return;
            }
            const rangeResult = (results || [])[0];
            if (RangeRetrievalSpecifierAttribute_1.default.hasRangeAttributes(rangeResult)) {
                for (const key in rangeResult) {
                    result[key] = rangeResult[key];
                }
                this.parseRangeAttributes(result, newOpts, callback);
            }
            else {
                callback(null, result);
            }
        });
    }
    getUsersForGroup(groupName, callback) {
        this.findGroup({}, groupName, (err, group) => {
            if (err) {
                if (callback)
                    callback(err);
                return;
            }
            if (!group) {
                callback(null, []);
                return;
            }
            const users = [];
            const filter = personGroupFilter(group.gidNumber);
            const opts = {
                filter,
                scope: 'sub',
                attributes: ['dn', 'sn', 'cn', 'gidNumber', 'uid', 'displayName', 'mail'],
            };
            this.search(opts, (err, members) => {
                if (err) {
                    if (callback)
                        callback(err);
                    return;
                }
                async.forEach(members || [], (member, asyncCallback) => {
                    if (!member.groupType) {
                        users.push(new User_1.default(member));
                        asyncCallback();
                    }
                    else {
                        this.getUsersForGroup(member.cn, (err, nestedUsers) => {
                            if (nestedUsers) {
                                users.push(...nestedUsers);
                            }
                            asyncCallback();
                        });
                    }
                }, () => {
                    if (callback) {
                        callback(null, _.uniqBy(users, user => user.dn));
                    }
                });
            });
        });
    }
    findGroup(opts, groupName, callback) {
        const filter = groupFilter(groupName);
        const searchOpts = {
            filter,
            scope: 'sub',
        };
        this.search(searchOpts, (err, results) => {
            if (err) {
                if (callback)
                    callback(err);
                return;
            }
            if (!results || results.length === 0) {
                if (callback)
                    callback(null, undefined);
                return;
            }
            const group = new Group_1.default(results[0]);
            this.emit('group', group);
            if (callback)
                callback(null, group);
        });
    }
    findUser(opts, username, includeMembership, callback) {
        const options = {
            filter: personFilter(username),
            scope: 'sub',
            attributes: ['dn', 'sn', 'cn', 'gidNumber', 'uid', 'mail', 'displayName'],
        };
        this.search(options, (err, results) => {
            if (err) {
                if (callback)
                    callback(err);
                return;
            }
            if (!results || results.length === 0) {
                if (callback)
                    callback(null, undefined);
                return;
            }
            const user = new User_1.default(results[0]);
            this.emit('user', user);
            if (callback)
                callback(err, user);
        });
    }
    authenticate(username, password, callback) {
        if (!username || !password) {
            if (callback) {
                const err = {
                    code: 0x31,
                    errno: 'LDAP_INVALID_CREDENTIALS',
                    description: 'The supplied credential is invalid',
                };
                callback(err, false);
            }
            return;
        }
        const client = this.createClient();
        client.on('error', (err) => {
            if (err.errno !== 'ECONNRESET') {
                this.emit('error', err);
            }
        });
        client.bind(this.opts.username, this.opts.password, (err) => {
            if (err) {
                if (callback)
                    callback(err, false);
                return;
            }
            this.findUser({}, username, false, (err, res) => {
                if (err || !res || !res.dn) {
                    if (callback)
                        callback(err || null, false);
                    return;
                }
                client.bind(res.dn, password, (err) => {
                    client.unbind();
                    if (err) {
                        if (callback)
                            callback(err, false);
                        return;
                    }
                    if (callback)
                        callback(null, true);
                });
            });
        });
    }
}
exports.LdapClient = LdapClient;
const personFilter = (username) => `(&(objectClass=Person)(uid=${username}))`;
const groupFilter = (groupName) => `(&(objectClass=posixGroup)(cn=${groupName}))`;
const personGroupFilter = (gidNumber) => `(&(objectClass=Person)(gidNumber=${gidNumber}))`;
exports.default = LdapClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGRhcENsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9Nb2R1bGVzL01lbWJlcnNoaXAvTGRhcENsaWVudC9MZGFwQ2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxtQ0FBcUM7QUFDckMscURBQThCO0FBRTlCLHFEQUE4QjtBQUM5QixrREFBMkI7QUFFM0IsbUVBQWtDO0FBQ2xDLGlFQUFnQztBQUNoQyxrSEFBaUY7QUFhakYsTUFBYSxVQUFXLFNBQVEscUJBQVk7SUFDbEMsSUFBSSxDQUFrQjtJQU05QixZQUFZLE1BQXdCO1FBQ2xDLEtBQUssRUFBRSxDQUFBO1FBQ1AsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUE7SUFDcEIsQ0FBQztJQU1PLFlBQVk7UUFDbEIsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDO1lBQ3ZCLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUc7WUFDbEIsU0FBUyxFQUFFLElBQUk7U0FDaEIsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQU9PLE1BQU0sQ0FBQyxJQUFtQixFQUFFLFFBQW1DO1FBQ3JFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQTtRQUVsQyxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQWMsRUFBRSxFQUFFO1lBRXBDLElBQUksQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLFlBQVksRUFBRSxDQUFDO2dCQUN2QyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQTtZQUN6QixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUE7UUFFRixNQUFNLE9BQU8sR0FBZ0IsRUFBRSxDQUFBO1FBTS9CLE1BQU0sYUFBYSxHQUFHLENBQUMsS0FBa0IsRUFBUSxFQUFFO1lBQ2pELE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFtQixDQUFBO1lB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