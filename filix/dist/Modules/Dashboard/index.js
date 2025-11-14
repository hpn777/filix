"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Module = void 0;
const tslib_1 = require("tslib");
const crypto = tslib_1.__importStar(require("crypto"));
const linq_1 = tslib_1.__importDefault(require("linq"));
const tessio_1 = require("tessio");
const base_1 = require("../base");
const logger_1 = require("../../utils/logger");
const ModuleHelpers_1 = require("../utils/ModuleHelpers");
const fixturesLoader_1 = require("./fixturesLoader");
class Module extends base_1.BaseModule {
    evH;
    dbModule;
    membershipProvider;
    moduleName = 'Dashboard';
    fixtures;
    publicMethods = new Map([
        ['Ready', this.Ready],
        ['GetDashboardTabs', this.GetDashboardTabs],
        ['GetDashboardControls', this.GetDashboardControls],
        ['GetDashboardModulesVersions', this.GetDashboardModulesVersions],
        ['GetDashboardModules', this.GetDashboardModules],
        ['SaveTabOrderAndSelection', this.SaveTabOrderAndSelection],
        ['SaveDashboardTab', this.SaveDashboardTab],
        ['RemoveDashboardTab', this.RemoveDashboardTab],
        ['SaveControl', this.SaveControl],
        ['RemoveControl', this.RemoveControl],
        ['GetTabPresets', this.GetTabPresets],
        ['SaveTabPreset', this.SaveTabPreset],
        ['RemoveTabPreset', this.RemoveTabPreset],
        ['GetAllUsers', this.GetAllUsers],
        ['GetUserConfig', this.GetUserConfig],
        ['SaveUserConfig', this.SaveUserConfig],
        ['UpdatePassword', this.UpdatePassword],
    ]);
    async init() {
        logger_1.logger.info('Module initialized', {
            module: this.moduleName,
        });
        this.membershipProvider = await ModuleHelpers_1.ModuleHelpers.getModule(this.subscriptionManager, this.config.membership_module);
        this.dbModule = await ModuleHelpers_1.ModuleHelpers.getModule(this.subscriptionManager, this.config.db_module);
        if (this.dbModule) {
            this.evH = this.dbModule.evH;
        }
        if (typeof this.evH.whenReady === 'function') {
            await this.evH.whenReady();
        }
        this.fixtures = (0, fixturesLoader_1.loadDashboardFixtures)(this.moduleName, this.config.fixtures_path);
        const codebaseUiModules = this.fixtures.uiModules;
        const modules = this.evH.get('module')?.getData() ?? [];
        const tabPresets = this.evH.get('tab_preset')?.getData() ?? [];
        if (tessio_1.lodash.isEmpty(modules)) {
            logger_1.logger.info('Reloading UI modules and presets from the codebase', {
                module: this.moduleName,
            });
            await this.reloadVersionsFromCodebase(codebaseUiModules);
        }
        else {
            logger_1.logger.info('Appending new UI modules and new modules versions from the codebase', { module: this.moduleName });
            await this.appendMissingVersions(codebaseUiModules);
        }
        if (tessio_1.lodash.isEmpty(tabPresets)) {
            logger_1.logger.info('Appending tab and control presets from the codebase', {
                module: this.moduleName,
            });
            await this.appendMissingPresets();
        }
        return new Promise((resolve, _reject) => {
            resolve(this);
        });
    }
    Ready(_request, subscription) {
        subscription.publish(null);
    }
    GetDashboardTabs(request, subscription) {
        const tesseract = ModuleHelpers_1.ModuleHelpers.getTesseract(this.evH, 'tab', subscription, 'Tab tesseract not found');
        if (!tesseract)
            return;
        ModuleHelpers_1.ModuleHelpers.setupSession(tesseract, {
            filter: [
                {
                    field: 'userId',
                    value: subscription.userId,
                    comparison: '==',
                },
                {
                    field: 'is_deleted',
                    comparison: '!=',
                    value: true,
                },
            ],
            sort: [
                {
                    field: 'sortOrder',
                    direction: 'ASC',
                },
            ],
        }, subscription, request);
    }
    GetDashboardControls(request, subscription) {
        let session = this.evH.createSession({
            table: 'control',
            subSessions: {
                module_roles: {
                    table: 'module_roles',
                    subSessions: {
                        user_roles: {
                            table: 'user_roles',
                            columns: [
                                {
                                    name: 'roles_id',
                                    primaryKey: true,
                                },
                                {
                                    name: 'user_id',
                                },
                            ],
                            filter: [
                                {
                                    field: 'user_id',
                                    value: subscription.userId,
                                    comparison: '==',
                                },
                            ],
                        },
                    },
                    columns: [
                        {
                            name: 'module_id',
                            primaryKey: true,
                        },
                        {
                            name: 'roles_id',
                        },
                        {
                            name: 'user_role',
                            resolve: {
                                underlyingField: 'roles_id',
                                session: 'user_roles',
                                displayField: 'roles_id',
                            },
                        },
                    ],
                    filter: [
                        {
                            field: 'user_role',
                            value: null,
                            comparison: '!=',
                        },
                    ],
                },
            },
            columns: [
                {
                    name: 'id',
                    primaryKey: true,
                },
                {
                    name: 'title',
                },
                {
                    name: 'config',
                },
                {
                    name: 'tabId',
                },
                {
                    name: 'moduleClassName',
                },
                {
                    name: 'moduleVersionId',
                },
                {
                    name: 'moduleId',
                    resolve: {
                        underlyingField: 'moduleVersionId',
                        childrenTable: 'module_version',
                        displayField: 'moduleId',
                    },
                },
                {
                    name: 'module_id_acl',
                    resolve: {
                        underlyingField: 'moduleId',
                        session: 'module_roles',
                        displayField: 'module_id',
                    },
                },
            ],
            filter: [
                {
                    field: 'tabId',
                    value: request.parameters.tabId,
                    comparison: '==',
                },
                {
                    field: 'module_id_acl',
                    value: null,
                    comparison: '!=',
                },
            ],
        }, true);
        session.on('dataUpdate', data => {
            subscription.publish(data.toJSON(), request.requestId);
        }, subscription);
        subscription.on('remove', () => {
            session.destroy();
        });
        subscription.publish({
            addedData: session.getData(),
        }, request.requestId);
    }
    GetDashboardModulesVersions(request, subscription) {
        let session = this.evH.createSession({
            table: 'module_version',
            subSessions: {
                module_roles: {
                    table: 'module_roles',
                    subSessions: {
                        user_roles: {
                            table: 'user_roles',
                            columns: [
                                {
                                    name: 'roles_id',
                                    primaryKey: true,
                                },
                                {
                                    name: 'user_id',
                                },
                            ],
                            filter: [
                                {
                                    field: 'user_id',
                                    value: subscription.userId,
                                    comparison: '==',
                                },
                            ],
                        },
                    },
                    columns: [
                        {
                            name: 'module_id',
                            primaryKey: true,
                        },
                        {
                            name: 'roles_id',
                        },
                        {
                            name: 'user_role',
                            resolve: {
                                underlyingField: 'roles_id',
                                session: 'user_roles',
                                displayField: 'roles_id',
                            },
                        },
                    ],
                    filter: [
                        {
                            field: 'user_role',
                            value: null,
                            comparison: '!=',
                        },
                    ],
                },
            },
            columns: [
                {
                    name: 'id',
                    primaryKey: true,
                },
                {
                    name: 'config',
                },
                {
                    name: 'version',
                },
                {
                    name: 'moduleId',
                },
                {
                    name: 'module_id_acl',
                    resolve: {
                        underlyingField: 'moduleId',
                        session: 'module_roles',
                        displayField: 'module_id',
                    },
                },
                {
                    name: 'public',
                },
            ],
            filter: [
                {
                    field: 'public',
                    value: 1,
                    comparison: '==',
                },
            ],
        }, true);
        session.on('dataUpdate', data => {
            subscription.publish(data.toJSON(), request.requestId);
        });
        subscription.on('remove', () => {
            session.destroy();
        });
        subscription.publish({
            addedData: session.getData(),
        }, request.requestId);
    }
    GetDashboardModules(request, subscription) {
        let session = this.evH.createSession({
            table: 'module',
            subSessions: {
                module_roles: {
                    table: 'module_roles',
                    subSessions: {
                        user_roles: {
                            table: 'user_roles',
                            columns: [
                                {
                                    name: 'roles_id',
                                    primaryKey: true,
                                },
                                {
                                    name: 'user_id',
                                },
                            ],
                            filter: [
                                {
                                    field: 'user_id',
                                    value: subscription.userId,
                                    comparison: '==',
                                },
                            ],
                        },
                    },
                    columns: [
                        {
                            name: 'module_id',
                            primaryKey: true,
                        },
                        {
                            name: 'roles_id',
                        },
                        {
                            name: 'user_role',
                            resolve: {
                                underlyingField: 'roles_id',
                                session: 'user_roles',
                                displayField: 'roles_id',
                            },
                        },
                    ],
                    filter: [
                        {
                            field: 'user_role',
                            value: null,
                            comparison: '!=',
                        },
                    ],
                },
            },
            columns: [
                {
                    name: 'id',
                    primaryKey: true,
                },
                {
                    name: 'name',
                },
                {
                    name: 'moduleClassName',
                },
                {
                    name: 'moduleType',
                },
                {
                    name: 'moduleGroup',
                },
                {
                    name: 'config',
                },
                {
                    name: 'parentId',
                },
                {
                    name: 'owner_id',
                },
                {
                    name: 'description',
                },
                {
                    name: 'module_id_acl',
                    resolve: {
                        underlyingField: 'id',
                        session: 'module_roles',
                        displayField: 'module_id',
                    },
                },
            ],
            filter: [
                {
                    field: 'module_id_acl',
                    value: null,
                    comparison: '!=',
                },
            ],
        }, true);
        session.on('dataUpdate', data => {
            subscription.publish(data.toJSON(), request.requestId);
        });
        subscription.on('remove', () => {
            session.destroy();
        });
        subscription.publish({
            addedData: session.getData(),
        }, request.requestId);
    }
    async SaveTabOrderAndSelection(request, subscription) {
        try {
            const response = await this.dbModule.save('tab', request.parameters.tabs);
            subscription.publish({
                err: null,
                response,
                success: true,
            }, request.requestId);
        }
        catch (err) {
            subscription.publish({
                err,
                response: null,
                success: false,
            }, request.requestId);
        }
    }
    async SaveDashboardTab(request, subscription) {
        const { tab, controls } = request.parameters;
        try {
            await this.dbModule.save('tab', tab);
            if (controls) {
                const response = await this.dbModule.save('control', controls);
                subscription.publish({
                    err: null,
                    response,
                    success: true,
                }, request.requestId);
            }
            else {
                subscription.publish({
                    err: null,
                    response: null,
                    success: true,
                }, request.requestId);
            }
        }
        catch (err) {
            subscription.publish({
                err,
                response: null,
                success: false,
            }, request.requestId);
        }
    }
    async RemoveDashboardTab(request, subscription) {
        let { err, result } = await this.dbModule.cascadeRemove('tab', request.parameters.tab.id);
        subscription.publish({
            err,
            response: result,
            success: err ? true : false,
        }, request.requestId);
    }
    async RemoveTabPreset(request, subscription) {
        let { err, result } = await this.dbModule.cascadeRemove('tab_preset', request.parameters.tabPreset.id);
        subscription.publish({
            err,
            response: result,
            success: err ? true : false,
        }, request.requestId);
    }
    async SaveControl(request, subscription) {
        try {
            const response = await this.dbModule.save('control', request.parameters.control);
            subscription.publish({
                err: null,
                response,
                success: true,
            }, request.requestId);
        }
        catch (err) {
            subscription.publish({
                err,
                response: null,
                success: false,
            }, request.requestId);
        }
    }
    async RemoveControl(request, subscription) {
        try {
            const controlId = request.parameters.control.id;
            await this.dbModule.remove('control', [controlId]);
            subscription.publish({
                err: null,
                result: { controlId },
                success: true,
            }, request.requestId);
        }
        catch (err) {
            subscription.publish({
                err,
                result: null,
                success: false,
            }, request.requestId);
        }
    }
    GetTabPresets(request, subscription) {
        const tabPresets = this.evH.get('tab_preset');
        const userDataTesseract = this.evH.get('user_data');
        const userRolesTesseract = this.evH.get('user_roles');
        if (!tabPresets || !userDataTesseract || !userRolesTesseract) {
            subscription.publishError({ message: 'Required tesseracts not found' }, request.requestId);
            return;
        }
        const user = userDataTesseract.getById(subscription.userId);
        if (!user) {
            subscription.publishError({ message: 'User not found' }, request.requestId);
            return;
        }
        const userRolesIds = userRolesTesseract
            .getLinq()
            .where(x => x.user_id === subscription.userId)
            .select(x => x.roles_id)
            .toArray();
        const session = tabPresets.createSession({
            filter: [
                {
                    field: 'userId',
                    value: [user.id, null],
                    comparison: 'in',
                },
            ],
        });
        const controlPresets = this.evH.get('control_preset');
        const moduleVersionsTesseract = this.evH.get('module_version');
        const moduleRolesTesseract = this.evH.get('module_roles');
        if (!controlPresets || !moduleVersionsTesseract || !moduleRolesTesseract) {
            subscription.publishError({ message: 'Module data not available' }, request.requestId);
            return;
        }
        const moduleVersions = moduleVersionsTesseract.getLinq();
        const moduleRoles = moduleRolesTesseract.getLinq();
        const getPresets = tabPresets => {
            const data = linq_1.default.from(tabPresets)
                .where(tabPreset => {
                tabPreset.controlPresets = controlPresets
                    .getLinq()
                    .where(controlPreset => {
                    const moduleVersionId = controlPreset.moduleVersionId;
                    const moduleVersion = moduleVersions.firstOrDefault(version => version.id === moduleVersionId);
                    return (controlPreset.tabPresetId === tabPreset.id &&
                        moduleRoles.firstOrDefault(moduleRole => moduleRole.module_id === moduleVersion.moduleId &&
                            userRolesIds.indexOf(moduleRole.roles_id) !== -1));
                })
                    .toArray();
                return tabPreset;
            })
                .orderBy(x => x.name)
                .toArray();
            return data;
        };
        session.off(undefined, undefined, subscription);
        session.on('dataUpdate', tabPresetsData => {
            tabPresetsData = tabPresetsData.toJSON();
            tabPresetsData.addedData = getPresets(tabPresetsData.addedData);
            tabPresetsData.updatedData = getPresets(tabPresetsData.updatedData);
            subscription.publish({
                presets: tabPresetsData,
            }, request.requestId);
        }, subscription);
        subscription.on('remove', () => {
            session.destroy();
        });
        subscription.publish({
            presets: {
                updatedData: getPresets(session.getData()),
            },
        }, request.requestId);
    }
    async SaveTabPreset(request, subscription) {
        const controlsCache = await this.evH.getTesseract('control');
        const controlsData = controlsCache.getData();
        const tabPreset = request.parameters.tab;
        if (tabPreset) {
            const tabId = tabPreset.tabId;
            const tabPresetId = tabPreset.id;
            try {
                await this.dbModule.save('tab_preset', tabPreset);
                const controls = controlsData.reduce((acc, control) => {
                    if (control.tabId === tabId) {
                        control.tabPresetId = tabPresetId;
                        acc.push(control);
                    }
                    return acc;
                }, []);
                const controlPresets = [];
                controls.forEach(control => {
                    controlPresets.push({
                        id: crypto.randomUUID(),
                        tabPresetId: control.tabPresetId,
                        title: control.title,
                        config: control.config,
                        moduleClassName: control.moduleClassName,
                        moduleVersionId: control.moduleVersionId,
                    });
                });
                const response = await this.dbModule.save('control_preset', controlPresets);
                subscription.publish({
                    err: null,
                    response,
                    success: true,
                }, request.requestId);
            }
            catch (err) {
                subscription.publish({
                    err,
                    response: null,
                    success: false,
                }, request.requestId);
            }
        }
    }
    GetAllUsers(request, subscription) {
        const userDataTesseract = this.evH.get('user_data');
        if (!userDataTesseract) {
            subscription.publishError({ message: 'User data not available' }, request.requestId);
            return;
        }
        const users = userDataTesseract
            .getLinq()
            .select(x => {
            return {
                id: x.id,
                userName: x.userName,
                email: x.email,
                displayName: x.displayName,
            };
        })
            .toArray();
        subscription.publish({
            users,
        }, request.requestId);
    }
    GetUserConfig(request, subscription) {
        const userDataTesseract = this.evH.get('user_data');
        if (!userDataTesseract) {
            subscription.publishError({ message: 'User data not available' }, request.requestId);
            return;
        }
        const user = userDataTesseract.getById(subscription.userId);
        if (user) {
            subscription.publish({
                config: user.config,
            }, request.requestId);
        }
        else {
            subscription.publishError({ message: 'User not found' }, request.requestId);
        }
    }
    async SaveUserConfig(request, subscription) {
        try {
            const status = await this.membershipProvider.dbModule.save('user_data', {
                id: subscription.userId,
                config: request.parameters.userConfig,
            });
            subscription.publish({
                configUpdated: status,
            }, request.requestId);
        }
        catch (_err) {
            subscription.publish({
                configUpdated: null,
            }, request.requestId);
        }
    }
    async UpdatePassword(request, subscription) {
        const data = {
            userId: subscription.userId,
            oldPassword: request.parameters.oldPassword,
            newPassword: request.parameters.newPassword,
        };
        try {
            await this.membershipProvider.updatePassword(data);
            subscription.publish({
                passwordUpdated: true,
            }, request.requestId);
        }
        catch (err) {
            subscription.publishError(err, request.requestId);
        }
    }
    async reloadVersionsFromCodebase(codebaseUiModules) {
        const modules = Object.values(codebaseUiModules).reduce((acc, m) => {
            const def = {
                id: m.id,
                name: m.name,
                moduleClassName: m.moduleClassName,
                moduleType: m.moduleType,
                moduleGroup: m.moduleGroup,
                parentId: m.parentId,
                description: m.description,
            };
            acc.definitions.push(def);
            m.roles.forEach(roleId => {
                acc.roles.push({ module_id: m.id, roles_id: roleId });
            });
            return acc;
        }, { definitions: [], roles: [] });
        await this.dbModule.save('module', modules.definitions);
        const versions = Object.values(codebaseUiModules).reduce((acc, m) => {
            m.versions.forEach(v => acc.push(this.createModuleVersion(m, v)));
            return acc;
        }, []);
        const cPresets = this.fixtures.controlPresets.filter((cp) => versions.find(v => v.id === cp.moduleVersionId));
        await this.dbModule.save('module_version', versions);
        await this.dbModule.save('module_roles', modules.roles);
        await this.dbModule.save('tab_preset', this.fixtures.tabPresets);
        await this.dbModule.save('control_preset', cPresets);
    }
    async appendMissingVersions(codebaseUiModules) {
        await Promise.all([
            ...Object.entries(codebaseUiModules).map(async ([id, def]) => {
                const moduleTesseract = this.evH.get('module');
                if (!moduleTesseract) {
                    throw new Error('Module tesseract not available');
                }
                const dbModule = moduleTesseract.getById(id);
                const versions = def.versions;
                if (!dbModule) {
                    logger_1.logger.info(`missing module id: ${def.id}, name: ${def.name}`, {
                        module: this.moduleName,
                    });
                    const defRoles = def.roles;
                    const module = await this.dbModule.save('module', def);
                    const roles = defRoles.map(roleId => ({
                        module_id: def.id,
                        roles_id: roleId,
                    }));
                    await this.dbModule.save('module_roles', roles);
                    versions.forEach(v => (v.moduleId = module[0].id));
                    console.log({ versions });
                    if (!tessio_1.lodash.isEmpty(versions)) {
                        const paths = versions.map(v => v.path);
                        logger_1.logger.info(`New modules versions loaded from the codebase: ${paths}`, { module: this.moduleName });
                        await this.dbModule.save('module_version', versions);
                    }
                }
                else {
                    const moduleVersionTesseract = this.evH.get('module_version');
                    if (!moduleVersionTesseract) {
                        throw new Error('Module version tesseract not available');
                    }
                    const existingVersions = moduleVersionTesseract
                        .getLinq()
                        .where(mv => mv.moduleId === dbModule.id)
                        .toArray();
                    const missingVersions = versions
                        .filter(v => !existingVersions.find(ev => ev.version === v.version))
                        .map(v => this.createModuleVersion(dbModule, v));
                    if (!tessio_1.lodash.isEmpty(missingVersions)) {
                        logger_1.logger.info(`New modules versions loaded from the codebase: ${missingVersions.map(version => version.id)}`, {
                            module: this.moduleName,
                        });
                        await this.dbModule.save('module_version', missingVersions);
                    }
                }
            }),
        ]);
    }
    async appendMissingPresets() {
        const tabPresetTesseract = this.evH.get('tab_preset');
        const controlPresetTesseract = this.evH.get('control_preset');
        if (!tabPresetTesseract || !controlPresetTesseract) {
            throw new Error('Preset tesseracts not available');
        }
        const missingTabPresets = [];
        this.fixtures.tabPresets.forEach((tp) => {
            const present = tabPresetTesseract.getById(tp.id);
            if (!present) {
                missingTabPresets.push(tp);
            }
        });
        const missingControlPresets = [];
        this.fixtures.controlPresets.forEach((cp) => {
            const present = controlPresetTesseract.getById(cp.id);
            if (!present) {
                missingControlPresets.push(cp);
            }
        });
        await this.dbModule.save('tab_preset', missingTabPresets);
        await this.dbModule.save('control_preset', missingControlPresets);
    }
    createModuleVersion(module, version) {
        return {
            id: version.id,
            version: version.version,
            config: version.config,
            moduleId: module.id,
            public: version.public,
        };
    }
}
exports.Module = Module;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvTW9kdWxlcy9EYXNoYm9hcmQvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLHVEQUFnQztBQUVoQyx3REFBNkI7QUFDN0IsbUNBQTZDO0FBRzdDLGtDQUFvRDtBQUlwRCwrQ0FBMkM7QUFDM0MsMERBQXNEO0FBQ3RELHFEQUFnRjtBQWdDaEYsTUFBYSxNQUFPLFNBQVEsaUJBQVU7SUFDcEMsR0FBRyxDQUFVO0lBQ2IsUUFBUSxDQUFrQjtJQUMxQixrQkFBa0IsQ0FBbUI7SUFDckMsVUFBVSxHQUFXLFdBQVcsQ0FBQTtJQUN4QixRQUFRLENBQW9CO0lBRXBDLGFBQWEsR0FBZ0MsSUFBSSxHQUFHLENBQUM7UUFDbkQsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUNyQixDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztRQUMzQyxDQUFDLHNCQUFzQixFQUFFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQztRQUNuRCxDQUFDLDZCQUE2QixFQUFFLElBQUksQ0FBQywyQkFBMkIsQ0FBQztRQUNqRSxDQUFDLHFCQUFxQixFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQztRQUNqRCxDQUFDLDBCQUEwQixFQUFFLElBQUksQ0FBQyx3QkFBd0IsQ0FBQztRQUMzRCxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztRQUMzQyxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztRQUMvQyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ2pDLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDckMsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQztRQUNyQyxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDO1FBQ3JDLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQztRQUN6QyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ2pDLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDckMsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDO1FBQ3ZDLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQztLQUN4QyxDQUFDLENBQUE7SUFFSyxLQUFLLENBQUMsSUFBSTtRQUNmLGVBQU0sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUU7WUFDaEMsTUFBTSxFQUFFLElBQUksQ0FBQyxVQUFVO1NBQ3hCLENBQUMsQ0FBQTtRQUVGLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxNQUFNLDZCQUFhLENBQUMsU0FBUyxDQUNyRCxJQUFJLENBQUMsbUJBQW1CLEVBQ3hCLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQTJCLENBQ3hDLENBQUE7UUFDRCxJQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sNkJBQWEsQ0FBQyxTQUFTLENBQzNDLElBQUksQ0FBQyxtQkFBbUIsRUFDeEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFtQixDQUNoQyxDQUFBO1FBRUQsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDbEIsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWMsQ0FBQTtRQUN6QyxDQUFDO1FBR0QsSUFBSSxPQUFRLElBQUksQ0FBQyxHQUFXLENBQUMsU0FBUyxLQUFLLFVBQVUsRUFBRSxDQUFDO1lBQ3RELE1BQU8sSUFBSSxDQUFDLEdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQTtRQUNyQyxDQUFDO1FBRUQsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFBLHNDQUFxQixFQUNuQyxJQUFJLENBQUMsVUFBVSxFQUNmLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBbUMsQ0FDaEQsQ0FBQTtRQUVELE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUE7UUFDakQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFBO1FBQ3ZELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQTtRQUU5RCxJQUFJLGVBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUN2QixlQUFNLENBQUMsSUFBSSxDQUFDLG9EQUFvRCxFQUFFO2dCQUNoRSxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVU7YUFDeEIsQ0FBQyxDQUFBO1lBQ0YsTUFBTSxJQUFJLENBQUMsMEJBQTBCLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtRQUMxRCxDQUFDO2FBQU0sQ0FBQztZQUNOLGVBQU0sQ0FBQyxJQUFJLENBQ1QscUVBQXFFLEVBQ3JFLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FDNUIsQ0FBQTtZQUNELE1BQU0sSUFBSSxDQUFDLHFCQUFxQixDQUFDLGlCQUFpQixDQUFDLENBQUE7UUFDckQsQ0FBQztRQUVELElBQUksZUFBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO1lBQzFCLGVBQU0sQ0FBQyxJQUFJLENBQUMscURBQXFELEVBQUU7Z0JBQ2pFLE1BQU0sRUFBRSxJQUFJLENBQUMsVUFBVTthQUN4QixDQUFDLENBQUE7WUFDRixNQUFNLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFBO1FBQ25DLENBQUM7UUFFRCxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxFQUFFO1lBQ3RDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUNmLENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVELEtBQUssQ0FBQyxRQUFpQixFQUFFLFlBQTBCO1FBQ2pELFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDNUIsQ0FBQztJQUVELGdCQUFnQixDQUFDLE9BQWdCLEVBQUUsWUFBMEI7UUFDM0QsTUFBTSxTQUFTLEdBQUcsNkJBQWEsQ0FBQyxZQUFZLENBQzFDLElBQUksQ0FBQyxHQUFHLEVBQ1IsS0FBSyxFQUNMLFlBQVksRUFDWix5QkFBeUIsQ0FDMUIsQ0FBQTtRQUNELElBQUksQ0FBQyxTQUFTO1lBQUUsT0FBTTtRQUV0Qiw2QkFBYSxDQUFDLFlBQVksQ0FDeEIsU0FBUyxFQUNUO1lBQ0UsTUFBTSxFQUFFO2dCQUNOO29CQUNFLEtBQUssRUFBRSxRQUFRO29CQUNmLEtBQUssRUFBRSxZQUFZLENBQUMsTUFBTTtvQkFDMUIsVUFBVSxFQUFFLElBQUk7aUJBQ2pCO2dCQUNEO29CQUNFLEtBQUssRUFBRSxZQUFZO29CQUNuQixVQUFVLEVBQUUsSUFBSTtvQkFDaEIsS0FBSyxFQUFFLElBQUk7aUJBQ1o7YUFDRjtZQUNELElBQUksRUFBRTtnQkFDSjtvQkFDRSxLQUFLLEVBQUUsV0FBVztvQkFDbEIsU0FBUyxFQUFFLEtBQUs7aUJBQ2pCO2FBQ0Y7U0FDRixFQUNELFlBQVksRUFDWixPQUFPLENBQ1IsQ0FBQTtJQUNILENBQUM7SUFFRCxvQkFBb0IsQ0FBQyxPQUFnQixFQUFFLFlBQTBCO1FBQy9ELElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUNsQztZQUNFLEtBQUssRUFBRSxTQUFTO1lBQ2hCLFdBQVcsRUFBRTtnQkFDWCxZQUFZLEVBQUU7b0JBQ1osS0FBSyxFQUFFLGNBQWM7b0JBQ3JCLFdBQVcsRUFBRTt3QkFDWCxVQUFVLEVBQUU7NEJBQ1YsS0FBSyxFQUFFLFlBQVk7NEJBQ25CLE9BQU8sRUFBRTtnQ0FDUDtvQ0FDRSxJQUFJLEVBQUUsVUFBVTtvQ0FDaEIsVUFBVSxFQUFFLElBQUk7aUNBQ2pCO2dDQUNEO29DQUNFLElBQUksRUFBRSxTQUFTO2lDQUNoQjs2QkFDRjs0QkFDRCxNQUFNLEVBQUU7Z0NBQ047b0NBQ0UsS0FBSyxFQUFFLFNBQVM7b0NBQ2hCLEtBQUssRUFBRSxZQUFZLENBQUMsTUFBTTtvQ0FDMUIsVUFBVSxFQUFFLElBQUk7aUNBQ2pCOzZCQUNGO3lCQUNGO3FCQUNGO29CQUNELE9BQU8sRUFBRTt3QkFDUDs0QkFDRSxJQUFJLEVBQUUsV0FBVzs0QkFDakIsVUFBVSxFQUFFLElBQUk7eUJBQ2pCO3dCQUNEOzRCQUNFLElBQUksRUFBRSxVQUFVO3lCQUNqQjt3QkFDRDs0QkFDRSxJQUFJLEVBQUUsV0FBVzs0QkFDakIsT0FBTyxFQUFFO2dDQUNQLGVBQWUsRUFBRSxVQUFVO2dDQUMzQixPQUFPLEVBQUUsWUFBWTtnQ0FDckIsWUFBWSxFQUFFLFVBQVU7NkJBQ3pCO3lCQUNGO3FCQUNGO29CQUNELE1BQU0sRUFBRTt3QkFDTjs0QkFDRSxLQUFLLEVBQUUsV0FBVzs0QkFDbEIsS0FBSyxFQUFFLElBQUk7NEJBQ1gsVUFBVSxFQUFFLElBQUk7eUJBQ2pCO3FCQUNGO2lCQUNGO2FBQ0Y7WUFDRCxPQUFPLEVBQUU7Z0JBQ1A7b0JBQ0UsSUFBSSxFQUFFLElBQUk7b0JBQ1YsVUFBVSxFQUFFLElBQUk7aUJBQ2pCO2dCQUNEO29CQUNFLElBQUksRUFBRSxPQUFPO2lCQUNkO2dCQUNEO29CQUNFLElBQUksRUFBRSxRQUFRO2lCQUNmO2dCQUNEO29CQUNFLElBQUksRUFBRSxPQUFPO2lCQUNkO2dCQUNEO29CQUNFLElBQUksRUFBRSxpQkFBaUI7aUJBQ3hCO2dCQUNEO29CQUNFLElBQUksRUFBRSxpQkFBaUI7aUJBQ3hCO2dCQUNEO29CQUNFLElBQUksRUFBRSxVQUFVO29CQUNoQixPQUFPLEVBQUU7d0JBQ1AsZUFBZSxFQUFFLGlCQUFpQjt3QkFDbEMsYUFBYSxFQUFFLGdCQUFnQjt3QkFDL0IsWUFBWSxFQUFFLFVBQVU7cUJBQ3pCO2lCQUNGO2dCQUNEO29CQUNFLElBQUksRUFBRSxlQUFlO29CQUNyQixPQUFPLEVBQUU7d0JBQ1AsZUFBZSxFQUFFLFVBQVU7d0JBQzNCLE9BQU8sRUFBRSxjQUFjO3dCQUN2QixZQUFZLEVBQUUsV0FBVztxQkFDMUI7aUJBQ0Y7YUFDRjtZQUNELE1BQU0sRUFBRTtnQkFDTjtvQkFDRSxLQUFLLEVBQUUsT0FBTztvQkFDZCxLQUFLLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFNO29CQUNoQyxVQUFVLEVBQUUsSUFBSTtpQkFDakI7Z0JBQ0Q7b0JBQ0UsS0FBSyxFQUFFLGVBQWU7b0JBQ3RCLEtBQUssRUFBRSxJQUFJO29CQUNYLFVBQVUsRUFBRSxJQUFJO2lCQUNqQjthQUNGO1NBQ0YsRUFDRCxJQUFJLENBQ0wsQ0FBQTtRQUlELE9BQU8sQ0FBQyxFQUFFLENBQ1IsWUFBWSxFQUNaLElBQUksQ0FBQyxFQUFFO1lBQ0wsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFBO1FBQ3hELENBQUMsRUFDRCxZQUFZLENBQ2IsQ0FBQTtRQUVELFlBQVksQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRTtZQUM3QixPQUFPLENBQUMsT0FBTyxFQUFFLENBQUE7UUFDbkIsQ0FBQyxDQUFDLENBQUE7UUFDRixZQUFZLENBQUMsT0FBTyxDQUNsQjtZQUNFLFNBQVMsRUFBRSxPQUFPLENBQUMsT0FBTyxFQUFFO1NBQzdCLEVBQ0QsT0FBTyxDQUFDLFNBQVMsQ0FDbEIsQ0FBQTtJQUNILENBQUM7SUFFRCwyQkFBMkIsQ0FBQyxPQUFnQixFQUFFLFlBQTBCO1FBQ3RFLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUNsQztZQUNFLEtBQUssRUFBRSxnQkFBZ0I7WUFDdkIsV0FBVyxFQUFFO2dCQUNYLFlBQVksRUFBRTtvQkFDWixLQUFLLEVBQUUsY0FBYztvQkFDckIsV0FBVyxFQUFFO3dCQUNYLFVBQVUsRUFBRTs0QkFDVixLQUFLLEVBQUUsWUFBWTs0QkFDbkIsT0FBTyxFQUFFO2dDQUNQO29DQUNFLElBQUksRUFBRSxVQUFVO29DQUNoQixVQUFVLEVBQUUsSUFBSTtpQ0FDakI7Z0NBQ0Q7b0NBQ0UsSUFBSSxFQUFFLFNBQVM7aUNBQ2hCOzZCQUNGOzRCQUNELE1BQU0sRUFBRTtnQ0FDTjtvQ0FDRSxLQUFLLEVBQUUsU0FBUztvQ0FDaEIsS0FBSyxFQUFFLFlBQVksQ0FBQyxNQUFNO29DQUMxQixVQUFVLEVBQUUsSUFBSTtpQ0FDakI7NkJBQ0Y7eUJBQ0Y7cUJBQ0Y7b0JBQ0QsT0FBTyxFQUFFO3dCQUNQOzRCQUNFLElBQUksRUFBRSxXQUFXOzRCQUNqQixVQUFVLEVBQUUsSUFBSTt5QkFDakI7d0JBQ0Q7NEJBQ0UsSUFBSSxFQUFFLFVBQVU7eUJBQ2pCO3dCQUNEOzRCQUNFLElBQUksRUFBRSxXQUFXOzRCQUNqQixPQUFPLEVBQUU7Z0NBQ1AsZUFBZSxFQUFFLFVBQVU7Z0NBQzNCLE9BQU8sRUFBRSxZQUFZO2dDQUNyQixZQUFZLEVBQUUsVUFBVTs2QkFDekI7eUJBQ0Y7cUJBQ0Y7b0JBQ0QsTUFBTSxFQUFFO3dCQUNOOzRCQUNFLEtBQUssRUFBRSxXQUFXOzRCQUNsQixLQUFLLEVBQUUsSUFBSTs0QkFDWCxVQUFVLEVBQUUsSUFBSTt5QkFDakI7cUJBQ0Y7aUJBQ0Y7YUFDRjtZQUNELE9BQU8sRUFBRTtnQkFDUDtvQkFDRSxJQUFJLEVBQUUsSUFBSTtvQkFDVixVQUFVLEVBQUUsSUFBSTtpQkFDakI7Z0JBQ0Q7b0JBQ0UsSUFBSSxFQUFFLFFBQVE7aUJBQ2Y7Z0JBQ0Q7b0JBQ0UsSUFBSSxFQUFFLFNBQVM7aUJBQ2hCO2dCQUNEO29CQUNFLElBQUksRUFBRSxVQUFVO2lCQUNqQjtnQkFDRDtvQkFDRSxJQUFJLEVBQUUsZUFBZTtvQkFDckIsT0FBTyxFQUFFO3dCQUNQLGVBQWUsRUFBRSxVQUFVO3dCQUMzQixPQUFPLEVBQUUsY0FBYzt3QkFDdkIsWUFBWSxFQUFFLFdBQVc7cUJBQzFCO2lCQUNGO2dCQUNEO29CQUNFLElBQUksRUFBRSxRQUFRO2lCQUNmO2FBQ0Y7WUFDRCxNQUFNLEVBQUU7Z0JBQ047b0JBQ0UsS0FBSyxFQUFFLFFBQVE7b0JBQ2YsS0FBSyxFQUFFLENBQUM7b0JBQ1IsVUFBVSxFQUFFLElBQUk7aUJBQ2pCO2FBQ0Y7U0FDRixFQUNELElBQUksQ0FDTCxDQUFBO1FBRUQsT0FBTyxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDOUIsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFBO1FBQ3hELENBQUMsQ0FBQyxDQUFBO1FBRUYsWUFBWSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFO1lBQzdCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQTtRQUNuQixDQUFDLENBQUMsQ0FBQTtRQUVGLFlBQVksQ0FBQyxPQUFPLENBQ2xCO1lBQ0UsU0FBUyxFQUFFLE9BQU8sQ0FBQyxPQUFPLEVBQUU7U0FDN0IsRUFDRCxPQUFPLENBQUMsU0FBUyxDQUNsQixDQUFBO0lBQ0gsQ0FBQztJQUVELG1CQUFtQixDQUFDLE9BQWdCLEVBQUUsWUFBMEI7UUFDOUQsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQ2xDO1lBQ0UsS0FBSyxFQUFFLFFBQVE7WUFDZixXQUFXLEVBQUU7Z0JBQ1gsWUFBWSxFQUFFO29CQUNaLEtBQUssRUFBRSxjQUFjO29CQUNyQixXQUFXLEVBQUU7d0JBQ1gsVUFBVSxFQUFFOzRCQUNWLEtBQUssRUFBRSxZQUFZOzRCQUNuQixPQUFPLEVBQUU7Z0NBQ1A7b0NBQ0UsSUFBSSxFQUFFLFVBQVU7b0NBQ2hCLFVBQVUsRUFBRSxJQUFJO2lDQUNqQjtnQ0FDRDtvQ0FDRSxJQUFJLEVBQUUsU0FBUztpQ0FDaEI7NkJBQ0Y7NEJBQ0QsTUFBTSxFQUFFO2dDQUNOO29DQUNFLEtBQUssRUFBRSxTQUFTO29DQUNoQixLQUFLLEVBQUUsWUFBWSxDQUFDLE1BQU07b0NBQzFCLFVBQVUsRUFBRSxJQUFJO2lDQUNqQjs2QkFDRjt5QkFDRjtxQkFDRjtvQkFDRCxPQUFPLEVBQUU7d0JBQ1A7NEJBQ0UsSUFBSSxFQUFFLFdBQVc7NEJBQ2pCLFVBQVUsRUFBRSxJQUFJO3lCQUNqQjt3QkFDRDs0QkFDRSxJQUFJLEVBQUUsVUFBVTt5QkFDakI7d0JBQ0Q7NEJBQ0UsSUFBSSxFQUFFLFdBQVc7NEJBQ2pCLE9BQU8sRUFBRTtnQ0FDUCxlQUFlLEVBQUUsVUFBVTtnQ0FDM0IsT0FBTyxFQUFFLFlBQVk7Z0NBQ3JCLFlBQVksRUFBRSxVQUFVOzZCQUN6Qjt5QkFDRjtxQkFDRjtvQkFDRCxNQUFNLEVBQUU7d0JBQ047NEJBQ0UsS0FBSyxFQUFFLFdBQVc7NEJBQ2xCLEtBQUssRUFBRSxJQUFJOzRCQUNYLFVBQVUsRUFBRSxJQUFJO3lCQUNqQjtxQkFDRjtpQkFDRjthQUNGO1lBQ0QsT0FBTyxFQUFFO2dCQUNQO29CQUNFLElBQUksRUFBRSxJQUFJO29CQUNWLFVBQVUsRUFBRSxJQUFJO2lCQUNqQjtnQkFDRDtvQkFDRSxJQUFJLEVBQUUsTUFBTTtpQkFDYjtnQkFDRDtvQkFDRSxJQUFJLEVBQUUsaUJBQWlCO2lCQUN4QjtnQkFDRDtvQkFDRSxJQUFJLEVBQUUsWUFBWTtpQkFDbkI7Z0JBQ0Q7b0JBQ0UsSUFBSSxFQUFFLGFBQWE7aUJBQ3BCO2dCQUNEO29CQUNFLElBQUksRUFBRSxRQUFRO2lCQUNmO2dCQUNEO29CQUNFLElBQUksRUFBRSxVQUFVO2lCQUNqQjtnQkFDRDtvQkFDRSxJQUFJLEVBQUUsVUFBVTtpQkFDakI7Z0JBQ0Q7b0JBQ0UsSUFBSSxFQUFFLGFBQWE7aUJBQ3BCO2dCQUNEO29CQUNFLElBQUksRUFBRSxlQUFlO29CQUNyQixPQUFPLEVBQUU7d0JBQ1AsZUFBZSxFQUFFLElBQUk7d0JBQ3JCLE9BQU8sRUFBRSxjQUFjO3dCQUN2QixZQUFZLEVBQUUsV0FBVztxQkFDMUI7aUJBQ0Y7YUFDRjtZQUNELE1BQU0sRUFBRTtnQkFDTjtvQkFDRSxLQUFLLEVBQUUsZUFBZTtvQkFDdEIsS0FBSyxFQUFFLElBQUk7b0JBQ1gsVUFBVSxFQUFFLElBQUk7aUJBQ2pCO2FBQ0Y7U0FDRixFQUNELElBQUksQ0FDTCxDQUFBO1FBSUQsT0FBTyxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDOUIsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFBO1FBQ3hELENBQUMsQ0FBQyxDQUFBO1FBRUYsWUFBWSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFO1lBQzdCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQTtRQUNuQixDQUFDLENBQUMsQ0FBQTtRQUVGLFlBQVksQ0FBQyxPQUFPLENBQ2xCO1lBQ0UsU0FBUyxFQUFFLE9BQU8sQ0FBQyxPQUFPLEVBQUU7U0FDN0IsRUFDRCxPQUFPLENBQUMsU0FBUyxDQUNsQixDQUFBO0lBQ0gsQ0FBQztJQUVELEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxPQUFnQixFQUFFLFlBQTBCO1FBQ3pFLElBQUksQ0FBQztZQUNILE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUE7WUFDekUsWUFBWSxDQUFDLE9BQU8sQ0FDbEI7Z0JBQ0UsR0FBRyxFQUFFLElBQUk7Z0JBQ1QsUUFBUTtnQkFDUixPQUFPLEVBQUUsSUFBSTthQUNkLEVBQ0QsT0FBTyxDQUFDLFNBQVMsQ0FDbEIsQ0FBQTtRQUNILENBQUM7UUFBQyxPQUFPLEdBQVEsRUFBRSxDQUFDO1lBQ2xCLFlBQVksQ0FBQyxPQUFPLENBQ2xCO2dCQUNFLEdBQUc7Z0JBQ0gsUUFBUSxFQUFFLElBQUk7Z0JBQ2QsT0FBTyxFQUFFLEtBQUs7YUFDZixFQUNELE9BQU8sQ0FBQyxTQUFTLENBQ2xCLENBQUE7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVELEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFnQixFQUFFLFlBQTBCO1FBQ2pFLE1BQU0sRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQTtRQUU1QyxJQUFJLENBQUM7WUFDSCxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQTtZQUVwQyxJQUFJLFFBQVEsRUFBRSxDQUFDO2dCQUNiLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFBO2dCQUM5RCxZQUFZLENBQUMsT0FBTyxDQUNsQjtvQkFDRSxHQUFHLEVBQUUsSUFBSTtvQkFDVCxRQUFRO29CQUNSLE9BQU8sRUFBRSxJQUFJO2lCQUNkLEVBQ0QsT0FBTyxDQUFDLFNBQVMsQ0FDbEIsQ0FBQTtZQUNILENBQUM7aUJBQU0sQ0FBQztnQkFDTixZQUFZLENBQUMsT0FBTyxDQUNsQjtvQkFDRSxHQUFHLEVBQUUsSUFBSTtvQkFDVCxRQUFRLEVBQUUsSUFBSTtvQkFDZCxPQUFPLEVBQUUsSUFBSTtpQkFDZCxFQUNELE9BQU8sQ0FBQyxTQUFTLENBQ2xCLENBQUE7WUFDSCxDQUFDO1FBQ0gsQ0FBQztRQUFDLE9BQU8sR0FBUSxFQUFFLENBQUM7WUFDbEIsWUFBWSxDQUFDLE9BQU8sQ0FDbEI7Z0JBQ0UsR0FBRztnQkFDSCxRQUFRLEVBQUUsSUFBSTtnQkFDZCxPQUFPLEVBQUUsS0FBSzthQUNmLEVBQ0QsT0FBTyxDQUFDLFNBQVMsQ0FDbEIsQ0FBQTtRQUNILENBQUM7SUFDSCxDQUFDO0lBRUQsS0FBSyxDQUFDLGtCQUFrQixDQUFDLE9BQWdCLEVBQUUsWUFBMEI7UUFDbkUsSUFBSSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUNyRCxLQUFLLEVBQ0wsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFJLENBQUMsRUFBRSxDQUMzQixDQUFBO1FBQ0QsWUFBWSxDQUFDLE9BQU8sQ0FDbEI7WUFDRSxHQUFHO1lBQ0gsUUFBUSxFQUFFLE1BQU07WUFDaEIsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLO1NBQzVCLEVBQ0QsT0FBTyxDQUFDLFNBQVMsQ0FDbEIsQ0FBQTtJQUNILENBQUM7SUFFRCxLQUFLLENBQUMsZUFBZSxDQUFDLE9BQWdCLEVBQUUsWUFBMEI7UUFDaEUsSUFBSSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUNyRCxZQUFZLEVBQ1osT0FBTyxDQUFDLFVBQVUsQ0FBQyxTQUFVLENBQUMsRUFBRSxDQUNqQyxDQUFBO1FBQ0QsWUFBWSxDQUFDLE9BQU8sQ0FDbEI7WUFDRSxHQUFHO1lBQ0gsUUFBUSxFQUFFLE1BQU07WUFDaEIsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLO1NBQzVCLEVBQ0QsT0FBTyxDQUFDLFNBQVMsQ0FDbEIsQ0FBQTtJQUNILENBQUM7SUFFRCxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQWdCLEVBQUUsWUFBMEI7UUFDNUQsSUFBSSxDQUFDO1lBQ0gsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FDdkMsU0FBUyxFQUNULE9BQU8sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUMzQixDQUFBO1lBQ0QsWUFBWSxDQUFDLE9BQU8sQ0FDbEI7Z0JBQ0UsR0FBRyxFQUFFLElBQUk7Z0JBQ1QsUUFBUTtnQkFDUixPQUFPLEVBQUUsSUFBSTthQUNkLEVBQ0QsT0FBTyxDQUFDLFNBQVMsQ0FDbEIsQ0FBQTtRQUNILENBQUM7UUFBQyxPQUFPLEdBQVEsRUFBRSxDQUFDO1lBQ2xCLFlBQVksQ0FBQyxPQUFPLENBQ2xCO2dCQUNFLEdBQUc7Z0JBQ0gsUUFBUSxFQUFFLElBQUk7Z0JBQ2QsT0FBTyxFQUFFLEtBQUs7YUFDZixFQUNELE9BQU8sQ0FBQyxTQUFTLENBQ2xCLENBQUE7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVELEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBZ0IsRUFBRSxZQUEwQjtRQUU5RCxJQUFJLENBQUM7WUFDSCxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLE9BQVEsQ0FBQyxFQUFFLENBQUE7WUFDaEQsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFBO1lBRWxELFlBQVksQ0FBQyxPQUFPLENBQ2xCO2dCQUNFLEdBQUcsRUFBRSxJQUFJO2dCQUNULE1BQU0sRUFBRSxFQUFFLFNBQVMsRUFBRTtnQkFDckIsT0FBTyxFQUFFLElBQUk7YUFDZCxFQUNELE9BQU8sQ0FBQyxTQUFTLENBQ2xCLENBQUE7UUFDSCxDQUFDO1FBQUMsT0FBTyxHQUFRLEVBQUUsQ0FBQztZQUNsQixZQUFZLENBQUMsT0FBTyxDQUNsQjtnQkFDRSxHQUFHO2dCQUNILE1BQU0sRUFBRSxJQUFJO2dCQUNaLE9BQU8sRUFBRSxLQUFLO2FBQ2YsRUFDRCxPQUFPLENBQUMsU0FBUyxDQUNsQixDQUFBO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFFRCxhQUFhLENBQUMsT0FBZ0IsRUFBRSxZQUEwQjtRQUN4RCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQTtRQUM3QyxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFBO1FBQ25ELE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUE7UUFFckQsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLGlCQUFpQixJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUM3RCxZQUFZLENBQUMsWUFBWSxDQUFDLEVBQUUsT0FBTyxFQUFFLCtCQUErQixFQUFFLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFBO1lBQzFGLE9BQU07UUFDUixDQUFDO1FBRUQsTUFBTSxJQUFJLEdBQUcsaUJBQWlCLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUMzRCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDVixZQUFZLENBQUMsWUFBWSxDQUFDLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFBO1lBQzNFLE9BQU07UUFDUixDQUFDO1FBRUQsTUFBTSxZQUFZLEdBQUcsa0JBQWtCO2FBQ3BDLE9BQU8sRUFBRTthQUNULEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLEtBQUssWUFBWSxDQUFDLE1BQU0sQ0FBQzthQUM3QyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO2FBQ3ZCLE9BQU8sRUFBRSxDQUFBO1FBRVosTUFBTSxPQUFPLEdBQUcsVUFBVSxDQUFDLGFBQWEsQ0FBQztZQUN2QyxNQUFNLEVBQUU7Z0JBQ047b0JBQ0UsS0FBSyxFQUFFLFFBQVE7b0JBQ2YsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUM7b0JBQ3RCLFVBQVUsRUFBRSxJQUFJO2lCQUNqQjthQUNGO1NBQ0YsQ0FBQyxDQUFBO1FBRUYsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtRQUNyRCxNQUFNLHVCQUF1QixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUE7UUFDOUQsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQTtRQUV6RCxJQUFJLENBQUMsY0FBYyxJQUFJLENBQUMsdUJBQXVCLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1lBQ3pFLFlBQVksQ0FBQyxZQUFZLENBQUMsRUFBRSxPQUFPLEVBQUUsMkJBQTJCLEVBQUUsRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUE7WUFDdEYsT0FBTTtRQUNSLENBQUM7UUFFRCxNQUFNLGNBQWMsR0FBRyx1QkFBdUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtRQUN4RCxNQUFNLFdBQVcsR0FBRyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtRQUVsRCxNQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsRUFBRTtZQUM5QixNQUFNLElBQUksR0FBRyxjQUFVLENBQUMsSUFBSSxDQUFNLFVBQVUsQ0FBQztpQkFDMUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUNqQixTQUFTLENBQUMsY0FBYyxHQUFHLGNBQWM7cUJBQ3RDLE9BQU8sRUFBRTtxQkFDVCxLQUFLLENBQUMsYUFBYSxDQUFDLEVBQUU7b0JBQ3JCLE1BQU0sZUFBZSxHQUFHLGFBQWEsQ0FBQyxlQUFlLENBQUE7b0JBQ3JELE1BQU0sYUFBYSxHQUFHLGNBQWMsQ0FBQyxjQUFjLENBQ2pELE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsS0FBSyxlQUFlLENBQzFDLENBQUE7b0JBRUQsT0FBTyxDQUNMLGFBQWEsQ0FBQyxXQUFXLEtBQUssU0FBUyxDQUFDLEVBQUU7d0JBQzFDLFdBQVcsQ0FBQyxjQUFjLENBQ3hCLFVBQVUsQ0FBQyxFQUFFLENBQ1gsVUFBVSxDQUFDLFNBQVMsS0FBSyxhQUFhLENBQUMsUUFBUTs0QkFDL0MsWUFBWSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQ25ELENBQ0YsQ0FBQTtnQkFDSCxDQUFDLENBQUM7cUJBQ0QsT0FBTyxFQUFFLENBQUE7Z0JBRVosT0FBTyxTQUFTLENBQUE7WUFDbEIsQ0FBQyxDQUFDO2lCQUNELE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7aUJBQ3BCLE9BQU8sRUFBRSxDQUFBO1lBRVosT0FBTyxJQUFJLENBQUE7UUFDYixDQUFDLENBQUE7UUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsWUFBWSxDQUFDLENBQUE7UUFDL0MsT0FBTyxDQUFDLEVBQUUsQ0FDUixZQUFZLEVBQ1osY0FBYyxDQUFDLEVBQUU7WUFDZixjQUFjLEdBQUcsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFBO1lBQ3hDLGNBQWMsQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQTtZQUMvRCxjQUFjLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUE7WUFDbkUsWUFBWSxDQUFDLE9BQU8sQ0FDbEI7Z0JBQ0UsT0FBTyxFQUFFLGNBQWM7YUFDeEIsRUFDRCxPQUFPLENBQUMsU0FBUyxDQUNsQixDQUFBO1FBQ0gsQ0FBQyxFQUNELFlBQVksQ0FDYixDQUFBO1FBRUQsWUFBWSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFO1lBQzdCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQTtRQUNuQixDQUFDLENBQUMsQ0FBQTtRQUVGLFlBQVksQ0FBQyxPQUFPLENBQ2xCO1lBQ0UsT0FBTyxFQUFFO2dCQUNQLFdBQVcsRUFBRSxVQUFVLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQzNDO1NBQ0YsRUFDRCxPQUFPLENBQUMsU0FBUyxDQUNsQixDQUFBO0lBQ0gsQ0FBQztJQUVELEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBZ0IsRUFBRSxZQUEwQjtRQUM5RCxNQUFNLGFBQWEsR0FBRyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFBO1FBQzVELE1BQU0sWUFBWSxHQUFHLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtRQUM1QyxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQTtRQUV4QyxJQUFJLFNBQVMsRUFBRSxDQUFDO1lBQ2QsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQTtZQUM3QixNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsRUFBRSxDQUFBO1lBRWhDLElBQUksQ0FBQztnQkFDSCxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FBQTtnQkFFakQsTUFBTSxRQUFRLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsRUFBRTtvQkFDcEQsSUFBSSxPQUFPLENBQUMsS0FBSyxLQUFLLEtBQUssRUFBRSxDQUFDO3dCQUM1QixPQUFPLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQTt3QkFDakMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtvQkFDbkIsQ0FBQztvQkFFRCxPQUFPLEdBQUcsQ0FBQTtnQkFDWixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7Z0JBRU4sTUFBTSxjQUFjLEdBQVUsRUFBRSxDQUFBO2dCQUVoQyxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUN6QixjQUFjLENBQUMsSUFBSSxDQUFDO3dCQUNsQixFQUFFLEVBQUUsTUFBTSxDQUFDLFVBQVUsRUFBRTt3QkFDdkIsV0FBVyxFQUFFLE9BQU8sQ0FBQyxXQUFXO3dCQUNoQyxLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUs7d0JBQ3BCLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTTt3QkFDdEIsZUFBZSxFQUFFLE9BQU8sQ0FBQyxlQUFlO3dCQUN4QyxlQUFlLEVBQUUsT0FBTyxDQUFDLGVBQWU7cUJBQ3pDLENBQUMsQ0FBQTtnQkFDSixDQUFDLENBQUMsQ0FBQTtnQkFFRixNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUN2QyxnQkFBZ0IsRUFDaEIsY0FBYyxDQUNmLENBQUE7Z0JBRUQsWUFBWSxDQUFDLE9BQU8sQ0FDbEI7b0JBQ0UsR0FBRyxFQUFFLElBQUk7b0JBQ1QsUUFBUTtvQkFDUixPQUFPLEVBQUUsSUFBSTtpQkFDZCxFQUNELE9BQU8sQ0FBQyxTQUFTLENBQ2xCLENBQUE7WUFDSCxDQUFDO1lBQUMsT0FBTyxHQUFRLEVBQUUsQ0FBQztnQkFDbEIsWUFBWSxDQUFDLE9BQU8sQ0FDbEI7b0JBQ0UsR0FBRztvQkFDSCxRQUFRLEVBQUUsSUFBSTtvQkFDZCxPQUFPLEVBQUUsS0FBSztpQkFDZixFQUNELE9BQU8sQ0FBQyxTQUFTLENBQ2xCLENBQUE7WUFDSCxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFFRCxXQUFXLENBQUMsT0FBZ0IsRUFBRSxZQUEwQjtRQUN0RCxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFBO1FBQ25ELElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQ3ZCLFlBQVksQ0FBQyxZQUFZLENBQUMsRUFBRSxPQUFPLEVBQUUseUJBQXlCLEVBQUUsRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUE7WUFDcEYsT0FBTTtRQUNSLENBQUM7UUFFRCxNQUFNLEtBQUssR0FBRyxpQkFBaUI7YUFDNUIsT0FBTyxFQUFFO2FBQ1QsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ1YsT0FBTztnQkFDTCxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUU7Z0JBQ1IsUUFBUSxFQUFFLENBQUMsQ0FBQyxRQUFRO2dCQUNwQixLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUs7Z0JBQ2QsV0FBVyxFQUFFLENBQUMsQ0FBQyxXQUFXO2FBQzNCLENBQUE7UUFDSCxDQUFDLENBQUM7YUFDRCxPQUFPLEVBQUUsQ0FBQTtRQUVaLFlBQVksQ0FBQyxPQUFPLENBQ2xCO1lBQ0UsS0FBSztTQUNOLEVBQ0QsT0FBTyxDQUFDLFNBQVMsQ0FDbEIsQ0FBQTtJQUNILENBQUM7SUFFRCxhQUFhLENBQUMsT0FBZ0IsRUFBRSxZQUEwQjtRQUN4RCxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFBO1FBQ25ELElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQ3ZCLFlBQVksQ0FBQyxZQUFZLENBQUMsRUFBRSxPQUFPLEVBQUUseUJBQXlCLEVBQUUsRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUE7WUFDcEYsT0FBTTtRQUNSLENBQUM7UUFFRCxNQUFNLElBQUksR0FBRyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBRTNELElBQUksSUFBSSxFQUFFLENBQUM7WUFDVCxZQUFZLENBQUMsT0FBTyxDQUNsQjtnQkFDRSxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07YUFDcEIsRUFDRCxPQUFPLENBQUMsU0FBUyxDQUNsQixDQUFBO1FBQ0gsQ0FBQzthQUFNLENBQUM7WUFDTixZQUFZLENBQUMsWUFBWSxDQUFDLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFBO1FBQzdFLENBQUM7SUFDSCxDQUFDO0lBRUQsS0FBSyxDQUFDLGNBQWMsQ0FBQyxPQUFnQixFQUFFLFlBQTBCO1FBQy9ELElBQUksQ0FBQztZQUNILE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQ3hELFdBQVcsRUFDWDtnQkFDRSxFQUFFLEVBQUUsWUFBWSxDQUFDLE1BQU07Z0JBQ3ZCLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLFVBQVU7YUFDdEMsQ0FDRixDQUFBO1lBQ0QsWUFBWSxDQUFDLE9BQU8sQ0FDbEI7Z0JBQ0UsYUFBYSxFQUFFLE1BQU07YUFDdEIsRUFDRCxPQUFPLENBQUMsU0FBUyxDQUNsQixDQUFBO1FBQ0gsQ0FBQztRQUFDLE9BQU8sSUFBSSxFQUFFLENBQUM7WUFDZCxZQUFZLENBQUMsT0FBTyxDQUNsQjtnQkFDRSxhQUFhLEVBQUUsSUFBSTthQUNwQixFQUNELE9BQU8sQ0FBQyxTQUFTLENBQ2xCLENBQUE7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVELEtBQUssQ0FBQyxjQUFjLENBQUMsT0FBZ0IsRUFBRSxZQUEwQjtRQUMvRCxNQUFNLElBQUksR0FBRztZQUNYLE1BQU0sRUFBRSxZQUFZLENBQUMsTUFBTTtZQUMzQixXQUFXLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxXQUFXO1lBQzNDLFdBQVcsRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLFdBQVc7U0FDNUMsQ0FBQTtRQUVELElBQUksQ0FBQztZQUNILE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUNsRCxZQUFZLENBQUMsT0FBTyxDQUNsQjtnQkFDRSxlQUFlLEVBQUUsSUFBSTthQUN0QixFQUNELE9BQU8sQ0FBQyxTQUFTLENBQ2xCLENBQUE7UUFDSCxDQUFDO1FBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUNiLFlBQVksQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQTtRQUNuRCxDQUFDO0lBQ0gsQ0FBQztJQUVELEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxpQkFBaUI7UUFDbEQsTUFBTSxPQUFPLEdBQVEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLE1BQU0sQ0FDeEQsQ0FBQyxHQUFRLEVBQUUsQ0FBTSxFQUFFLEVBQUU7WUFDbkIsTUFBTSxHQUFHLEdBQUc7Z0JBQ1YsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFO2dCQUNSLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSTtnQkFDWixlQUFlLEVBQUUsQ0FBQyxDQUFDLGVBQWU7Z0JBQ2xDLFVBQVUsRUFBRSxDQUFDLENBQUMsVUFBVTtnQkFDeEIsV0FBVyxFQUFFLENBQUMsQ0FBQyxXQUFXO2dCQUMxQixRQUFRLEVBQUUsQ0FBQyxDQUFDLFFBQVE7Z0JBQ3BCLFdBQVcsRUFBRSxDQUFDLENBQUMsV0FBVzthQUMzQixDQUFBO1lBQ0QsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDekIsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ3ZCLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUE7WUFDdkQsQ0FBQyxDQUFDLENBQUE7WUFFRixPQUFPLEdBQUcsQ0FBQTtRQUNaLENBQUMsRUFDRCxFQUFFLFdBQVcsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxDQUMvQixDQUFBO1FBRUQsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFBO1FBQ3ZELE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxNQUFNLENBQ3RELENBQUMsR0FBUSxFQUFFLENBQU0sRUFBRSxFQUFFO1lBQ25CLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNqRSxPQUFPLEdBQUcsQ0FBQTtRQUNaLENBQUMsRUFDRCxFQUFFLENBQ0gsQ0FBQTtRQUNELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQU8sRUFBRSxFQUFFLENBQzlELFFBQWtDLENBQUMsSUFBSSxDQUN0QyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLGVBQWUsQ0FDakMsQ0FDRixDQUFBO1FBQ0QsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxRQUFRLENBQUMsQ0FBQTtRQUN0RCxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDdkQsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUNoRSxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxDQUFBO0lBQ3BELENBQUM7SUFFRCxLQUFLLENBQUMscUJBQXFCLENBQUMsaUJBQWlCO1FBQzNDLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUNoQixHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBUSxFQUFFLEVBQUU7Z0JBQ2xFLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBO2dCQUM5QyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7b0JBQ3JCLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0NBQWdDLENBQUMsQ0FBQTtnQkFDbkQsQ0FBQztnQkFFRCxNQUFNLFFBQVEsR0FBRyxlQUFlLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFBO2dCQUM1QyxNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFBO2dCQUU3QixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7b0JBQ2QsZUFBTSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxDQUFDLEVBQUUsV0FBVyxHQUFHLENBQUMsSUFBSSxFQUFFLEVBQUU7d0JBQzdELE1BQU0sRUFBRSxJQUFJLENBQUMsVUFBVTtxQkFDeEIsQ0FBQyxDQUFBO29CQUNGLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUE7b0JBRTFCLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFBO29CQUV0RCxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDcEMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxFQUFFO3dCQUNqQixRQUFRLEVBQUUsTUFBTTtxQkFDakIsQ0FBQyxDQUFDLENBQUE7b0JBRUgsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsS0FBSyxDQUFDLENBQUE7b0JBRS9DLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7b0JBRWxELE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFBO29CQUV6QixJQUFJLENBQUMsZUFBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO3dCQUN6QixNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFBO3dCQUV2QyxlQUFNLENBQUMsSUFBSSxDQUNULGtEQUFrRCxLQUFLLEVBQUUsRUFDekQsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUM1QixDQUFBO3dCQUVELE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDLENBQUE7b0JBQ3RELENBQUM7Z0JBQ0gsQ0FBQztxQkFBTSxDQUFDO29CQUNOLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtvQkFDN0QsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7d0JBQzVCLE1BQU0sSUFBSSxLQUFLLENBQUMsd0NBQXdDLENBQUMsQ0FBQTtvQkFDM0QsQ0FBQztvQkFFRCxNQUFNLGdCQUFnQixHQUFHLHNCQUFzQjt5QkFDNUMsT0FBTyxFQUFFO3lCQUNULEtBQUssQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDLEVBQUUsQ0FBQzt5QkFDeEMsT0FBTyxFQUFFLENBQUE7b0JBRVosTUFBTSxlQUFlLEdBQUcsUUFBUTt5QkFDN0IsTUFBTSxDQUNMLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsT0FBTyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FDNUQ7eUJBQ0EsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO29CQUVsRCxJQUFJLENBQUMsZUFBQyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDO3dCQUNoQyxlQUFNLENBQUMsSUFBSSxDQUNULGtEQUFrRCxlQUFlLENBQUMsR0FBRyxDQUNuRSxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQ3RCLEVBQUUsRUFDSDs0QkFDRSxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVU7eUJBQ3hCLENBQ0YsQ0FBQTt3QkFFRCxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLGVBQWUsQ0FBQyxDQUFBO29CQUM3RCxDQUFDO2dCQUNILENBQUM7WUFDSCxDQUFDLENBQUM7U0FDSCxDQUFDLENBQUE7SUFDSixDQUFDO0lBRUQsS0FBSyxDQUFDLG9CQUFvQjtRQUN4QixNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFBO1FBQ3JELE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtRQUU3RCxJQUFJLENBQUMsa0JBQWtCLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1lBQ25ELE1BQU0sSUFBSSxLQUFLLENBQUMsaUNBQWlDLENBQUMsQ0FBQTtRQUNwRCxDQUFDO1FBRUQsTUFBTSxpQkFBaUIsR0FBVSxFQUFFLENBQUE7UUFDbkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBTyxFQUFFLEVBQUU7WUFDM0MsTUFBTSxPQUFPLEdBQUcsa0JBQWtCLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUVqRCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ2IsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQzVCLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQTtRQUVGLE1BQU0scUJBQXFCLEdBQVUsRUFBRSxDQUFBO1FBQ3ZDLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQU8sRUFBRSxFQUFFO1lBQy9DLE1BQU0sT0FBTyxHQUFHLHNCQUFzQixDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUE7WUFFckQsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNiLHFCQUFxQixDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNoQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUE7UUFFRixNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxpQkFBaUIsQ0FBQyxDQUFBO1FBQ3pELE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUscUJBQXFCLENBQUMsQ0FBQTtJQUNuRSxDQUFDO0lBRUQsbUJBQW1CLENBQUMsTUFBTSxFQUFFLE9BQU87UUFDakMsT0FBTztZQUNMLEVBQUUsRUFBRSxPQUFPLENBQUMsRUFBRTtZQUNkLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTztZQUN4QixNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU07WUFDdEIsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFO1lBQ25CLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTTtTQUN2QixDQUFBO0lBQ0gsQ0FBQztDQUVGO0FBNWdDRCx3QkE0Z0NDIn0=