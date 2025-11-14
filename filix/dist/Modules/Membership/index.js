"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Module = void 0;
const tslib_1 = require("tslib");
const crypto = tslib_1.__importStar(require("crypto"));
const tessio_1 = require("tessio");
const base_1 = require("../base");
const adminData_json_1 = tslib_1.__importDefault(require("../../fixtures/adminData.json"));
const roles_json_1 = tslib_1.__importDefault(require("../../fixtures/roles.json"));
const logger_1 = require("../../utils/logger");
const ModuleHelpers_1 = require("../utils/ModuleHelpers");
const rolesDataCopy = JSON.parse(JSON.stringify(roles_json_1.default));
class Module extends base_1.BaseModule {
    defaults() {
        return {
            ready: false,
            users: null,
            roles: null,
            apiAccess: null,
            usernameKey: null,
        };
    }
    dbModule;
    evH;
    identityProvider;
    users;
    roles;
    apiAccess;
    usernameKey;
    publicMethods = new Map([
        ['GetAllUsers', this.GetAllUsers],
        ['GetUsers', this.GetUsers],
        ['GetAllRoles', this.GetAllRoles],
        ['UpdateUser', this.UpdateUser],
        ['DeactiveUser', this.DeactiveUser],
        ['GetColumnsDefinition', this.GetColumnsDefinition],
        ['RemoveData', this.RemoveUser],
    ]);
    async init() {
        const config = this.config;
        return new Promise(async (resolve, reject) => {
            this.dbModule = await ModuleHelpers_1.ModuleHelpers.getModule(this.subscriptionManager, config.db_module);
            if (!this.dbModule) {
                reject(new Error(`Membership module cannot load data provider '${config.db_module}'`));
                return;
            }
            const waitForEventHorizon = async () => {
                const deadline = Date.now() + 30000;
                while (Date.now() < deadline) {
                    if (this.dbModule.evH) {
                        return this.dbModule.evH;
                    }
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                throw new Error(`Membership module timed out waiting for '${config.db_module}' event horizon`);
            };
            this.evH = this.dbModule.evH || (await waitForEventHorizon());
            if (typeof this.evH.whenReady === 'function') {
                await this.evH.whenReady();
            }
            const roles = this.evH.get('app_role')?.getData() ?? [];
            const users = this.evH.get('user_data')?.getData() ?? [];
            const userRoles = this.evH.get('user_roles')?.getData() ?? [];
            const skipFixtures = config.skipFixtureLoading || false;
            if (!skipFixtures) {
                if (tessio_1.lodash.isEmpty(roles)) {
                    await this.dbModule.save('app_role', rolesDataCopy);
                }
                if (tessio_1.lodash.isEmpty(users)) {
                    const adminUser = { ...adminData_json_1.default.admin, id: 1 };
                    await this.dbModule.save('user_data', adminUser);
                }
                if (tessio_1.lodash.isEmpty(userRoles)) {
                    await this.dbModule.save('user_roles', adminData_json_1.default.roles);
                }
            }
            if (this.config.activeDirectory) {
                try {
                    const { default: ADMembershipModule } = await Promise.resolve().then(() => tslib_1.__importStar(require('./ADMembership'))).then(module => ({ default: module.default ?? module }));
                    const config = this.config.activeDirectory;
                    this.identityProvider = new ADMembershipModule({ config });
                    this.usernameKey = config.usernameKey;
                    this.populateUsers(config, () => resolve(this));
                }
                catch (error) {
                    reject(error);
                    return;
                }
            }
            else if (this.config.openLdap) {
                try {
                    const { default: OpenLdapMembershipModule } = await Promise.resolve().then(() => tslib_1.__importStar(require('./OpenLdapMembership'))).then(module => ({ default: module.default ?? module }));
                    const config = this.config.openLdap;
                    this.identityProvider = new OpenLdapMembershipModule({ config });
                    this.usernameKey = config.usernameKey;
                    this.populateUsers(config, () => resolve(this));
                }
                catch (error) {
                    reject(error);
                    return;
                }
            }
            else {
                resolve(this);
            }
        });
    }
    GetAllUsers(request, subscription) {
        const userDataTesseract = ModuleHelpers_1.ModuleHelpers.getTesseract(this.evH, 'user_data', subscription, 'User data not found');
        if (!userDataTesseract)
            return;
        try {
            ModuleHelpers_1.ModuleHelpers.publishSuccess(subscription, request.requestId, {
                users: userDataTesseract
                    .getLinq()
                    .select(x => ({
                    id: x.id,
                    userName: x.userName,
                    email: x.email,
                    displayName: x.displayName,
                    active: x.active,
                }))
                    .toArray(),
            });
        }
        catch (error) {
            subscription.publishError({ message: `GetAllUsers error: ${error}` }, request.requestId);
        }
    }
    GetUsers(request, subscription) {
        const userDataTesseract = ModuleHelpers_1.ModuleHelpers.getTesseract(this.evH, 'user_data', subscription, 'User data not found');
        if (!userDataTesseract)
            return;
        const users = userDataTesseract.createSession({
            columns: userDataTesseract
                .getHeader()
                .filter(x => [
                'id',
                'userName',
                'email',
                'displayName',
                'active',
            ].some(y => y === x.name)),
        });
        subscription.publish({
            header: users.getSimpleHeader(),
            data: users.getData(),
            type: 'reset',
        }, request.requestId);
        users.on('dataUpdate', updated => {
            subscription.publish({
                data: updated.toJSON(),
                type: 'update',
            }, request.requestId);
        }, subscription);
        subscription.on('remove', () => {
            users.destroy();
        });
    }
    GetColumnsDefinition(request, subscription) {
        let header;
        switch (request.parameters.tableName) {
            case 'user_data':
                const includedColumns = [
                    'id',
                    'userName',
                    'email',
                    'displayName',
                    'active',
                ];
                const userDataTesseract = this.evH.get('user_data');
                if (userDataTesseract) {
                    header = userDataTesseract
                        .getHeader()
                        .filter(x => includedColumns.some(y => y === x.name));
                }
                break;
        }
        subscription.publish({
            header: header || [],
            type: 'reset',
        }, request.requestId);
    }
    GetAllRoles(request, subscription) {
        subscription.publish({ roles: this.evH.get('app_role')?.getData() ?? [] }, request.requestId);
    }
    async UpdateUser(request, subscription) {
        try {
            await this.updateUsers(request.parameters.data);
            subscription.publish({
                success: true,
            }, request.requestId);
        }
        catch (error) {
            subscription.publishError({ message: error.sqlMessage || error.message });
        }
    }
    DeactiveUser(request, subscription) {
        const userId = request.parameters.data[0];
        if (userId != subscription.userId) {
            this.deactiveUser(userId);
        }
    }
    async RemoveUser(request, subscription) {
        const userId = request.parameters.data[0];
        if (userId != subscription.userId) {
            await this.dbModule.cascadeRemove('user_data', [userId]);
        }
    }
    async updateUsers(users) {
        const cachedUsers = this.evH.get('user_data');
        if (!cachedUsers) {
            throw new Error('User data not found');
        }
        if (!Array.isArray(users)) {
            users = [users];
        }
        const results = [];
        for (const user of users) {
            const cachedUser = cachedUsers.getById(user.id);
            if (!cachedUser) {
                user.password = crypto
                    .createHash('sha256')
                    .update(user.userName)
                    .digest('hex');
            }
            else if (user.password) {
                user.password = crypto
                    .createHash('sha256')
                    .update(user.password)
                    .digest('hex');
            }
            const result = await this.dbModule.save('user_data', user);
            results.push(result);
        }
        return results;
    }
    async updatePassword(data) {
        const users = this.evH.get('user_data');
        if (!users) {
            throw new Error('User data not found');
        }
        const cachedUser = users.getById(data.userId);
        if (cachedUser.password !==
            crypto.createHash('sha256').update(data.oldPassword).digest('hex')) {
            throw new Error('Old password is invalid');
        }
        cachedUser.password = crypto
            .createHash('sha256')
            .update(data.newPassword)
            .digest('hex');
        cachedUser.firstLogin = false;
        await this.dbModule.save('user_data', cachedUser);
        return true;
    }
    deactiveUser(userId) {
        const userDataTesseract = this.evH.get('user_data');
        if (!userDataTesseract) {
            logger_1.logger.error('User data not found');
            return;
        }
        const user = userDataTesseract.getById(userId);
        user.active = false;
        this.dbModule.save('user_data', user);
    }
    async login(userName, password) {
        const hash = crypto.createHash('sha256').update(password).digest('hex');
        const identityProvider = this.identityProvider;
        const users = this.evH.get('user_data');
        const config = this.config;
        const cd = 86400000;
        const tokenValidInDays = config.tokenValidInDays || 1;
        if (!users) {
            throw { category: 'AUTH_ERROR', message: 'User data not available' };
        }
        const prepareUserForLogin = async (selectedUser, adUser) => {
            if (!selectedUser) {
                throw { category: 'AUTH_ERROR', message: 'Invalid credentials' };
            }
            if (!selectedUser.tokenCreated ||
                (selectedUser.tokenCreated &&
                    Math.floor((new Date().getTime() -
                        new Date(selectedUser.tokenCreated).getTime()) /
                        cd) >= tokenValidInDays)) {
                selectedUser.tokenCreated = new Date()
                    .toISOString()
                    .slice(0, 19)
                    .replace('T', ' ');
                selectedUser.authToken = crypto.randomUUID();
            }
            const userRolesTesseract = this.evH.get('user_roles');
            const appRoleTesseract = this.evH.get('app_role');
            if (userRolesTesseract && appRoleTesseract) {
                selectedUser.roles = userRolesTesseract
                    .getLinq()
                    .where(x => x.user_id === selectedUser.id)
                    .select(x => ({
                    id: x.roles_id,
                    roleName: appRoleTesseract.getById(x.roles_id)?.roleName,
                }))
                    .toArray();
            }
            else {
                selectedUser.roles = [];
            }
            if (adUser) {
                selectedUser.displayName = adUser.displayName;
                selectedUser.email = adUser.mail;
            }
            await this.dbModule.save('user_data', selectedUser);
            return selectedUser;
        };
        if (identityProvider) {
            return new Promise((resolve, reject) => {
                identityProvider.login(userName, password, (error, auth) => {
                    if (auth) {
                        identityProvider.getUser(userName, (err, adUser) => {
                            if (adUser) {
                                const cachedUser = users
                                    .getLinq()
                                    .firstOrDefault(x => x.userName === adUser[this.usernameKey]);
                                prepareUserForLogin(cachedUser, adUser)
                                    .then(resolve)
                                    .catch(reject);
                            }
                            else {
                                reject({ category: 'AUTH_ERROR', message: 'Invalid credentials' });
                            }
                        });
                    }
                    else {
                        const friendlyError = {
                            category: 'AUTH_ERROR',
                            message: `User: ${userName} used invalid credentials.`,
                        };
                        logger_1.logger.error(`User: ${userName} login error: ${error}`, {
                            module: 'Membership',
                        });
                        reject(friendlyError);
                    }
                });
            });
        }
        else {
            const tempUsers = users
                .getLinq()
                .firstOrDefault(x => x.userName === userName && x.password === hash && x.active);
            return prepareUserForLogin(tempUsers);
        }
    }
    authenticate(userId, authToken) {
        const config = this.config;
        let user;
        const cd = 86400000;
        const tokenValidInDays = config.tokenValidInDays || 1;
        const users = this.evH.get('user_data');
        if (!users) {
            throw {
                category: 'AUTH_ERROR',
                message: 'User data not available',
            };
        }
        const selectedUser = users
            .getLinq()
            .firstOrDefault(x => x.authToken === authToken && authToken);
        if (selectedUser &&
            selectedUser.active &&
            selectedUser.tokenCreated &&
            Math.floor((new Date().getTime() - new Date(selectedUser.tokenCreated).getTime()) /
                cd) < tokenValidInDays) {
            user = selectedUser;
        }
        if (!user) {
            throw {
                category: 'AUTH_ERROR',
                message: 'Invalid authentication token',
            };
        }
        return user;
    }
    resolveACL(userId, apiKey) {
        const apiAccessTesseract = this.evH.get('api_access');
        const userRolesTesseract = this.evH.get('user_roles');
        if (!apiAccessTesseract || !userRolesTesseract) {
            return false;
        }
        const apiAccessInstance = apiAccessTesseract.getById(apiKey);
        if (!apiAccessInstance ||
            (apiAccessInstance &&
                (!apiAccessInstance.roleId ||
                    userRolesTesseract
                        .getLinq()
                        .any(x => x.user_id === userId && x.roles_id === apiAccessInstance.roleId)))) {
            return true;
        }
        return false;
    }
    populateUsers(config, callback) {
        const usersCache = this.evH.get('user_data');
        const identityProvider = this.identityProvider;
        if (!identityProvider) {
            return;
        }
        if (!usersCache) {
            logger_1.logger.error('User data not available', { module: 'Membership' });
            return;
        }
        logger_1.logger.info(`Retriving Active Directory users from ${config.adGroup} group.`, { module: 'Membership' });
        identityProvider.getAllUsers(async (error, adUsers) => {
            if (error) {
                logger_1.logger.error(`Retriving users from Active Directory error: ${JSON.stringify(error)}`, { module: 'Membership' });
                throw error;
            }
            if (adUsers) {
                logger_1.logger.info(`${adUsers.length} user details received.`, {
                    module: 'Membership',
                });
                for (const adUser of adUsers) {
                    const user = {
                        userName: adUser[this.usernameKey],
                        email: adUser.userPrincipalName,
                        displayName: adUser.displayName,
                        active: true,
                    };
                    const selectedUser = usersCache
                        .getLinq()
                        .firstOrDefault(x => x.userName === user.userName);
                    if (!selectedUser) {
                        try {
                            await this.dbModule.save('user_data', user);
                            logger_1.logger.info(`${user.email} user saved`, {
                                module: 'Membership',
                            });
                        }
                        catch (error) {
                            logger_1.logger.error(`Failed to save user ${user.email}: ${error}`, {
                                module: 'Membership',
                            });
                        }
                    }
                    else {
                        user.id = selectedUser.id;
                        await this.dbModule.save('user_data', user);
                    }
                }
                for (const user of usersCache.getLinq().toArray()) {
                    if (!tessio_1.lodash.find(adUsers, y => y[this.usernameKey] === user.userName)) {
                        user.active = false;
                        await this.dbModule.save('user_data', user);
                    }
                }
                callback();
            }
            else {
                logger_1.logger.error('No users in group.', { module: 'Membership' });
            }
        });
    }
    logApiAccess(options) {
        this.dbModule.save('audit', options);
    }
}
exports.Module = Module;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvTW9kdWxlcy9NZW1iZXJzaGlwL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSx1REFBZ0M7QUFHaEMsbUNBQTZDO0FBRTdDLGtDQUFvRDtBQUNwRCwyRkFBcUQ7QUFDckQsbUZBQWlEO0FBS2pELCtDQUEyQztBQUMzQywwREFBc0Q7QUFJdEQsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFTLENBQUMsQ0FBQyxDQUFBO0FBRTNELE1BQWEsTUFBTyxTQUFRLGlCQUFVO0lBQ3BDLFFBQVE7UUFDTixPQUFPO1lBQ0wsS0FBSyxFQUFFLEtBQUs7WUFDWixLQUFLLEVBQUUsSUFBSTtZQUNYLEtBQUssRUFBRSxJQUFJO1lBQ1gsU0FBUyxFQUFFLElBQUk7WUFDZixXQUFXLEVBQUUsSUFBSTtTQUNsQixDQUFBO0lBQ0gsQ0FBQztJQUNELFFBQVEsQ0FBa0I7SUFDMUIsR0FBRyxDQUFVO0lBQ2IsZ0JBQWdCLENBQW1CO0lBQ25DLEtBQUssQ0FBQTtJQUNMLEtBQUssQ0FBQTtJQUNMLFNBQVMsQ0FBQTtJQUNULFdBQVcsQ0FBQTtJQUVYLGFBQWEsR0FBZ0MsSUFBSSxHQUFHLENBQUM7UUFDbkQsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUNqQyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQzNCLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDakMsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUMvQixDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDO1FBQ25DLENBQUMsc0JBQXNCLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixDQUFDO1FBQ25ELENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxVQUFVLENB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