"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericBaseModule = void 0;
exports.startService = startService;
const tslib_1 = require("tslib");
const findConfigurationSection_1 = tslib_1.__importDefault(require("./utils/findConfigurationSection"));
const container_1 = require("./container");
const utils_1 = require("./utils");
async function startService(options) {
    const { configPath, configSection = 'ui', moduleName = process.env.HOSTNAME || 'AppService', modules = [], } = options;
    utils_1.logger.init('AppService started', {
        module: moduleName,
        sessionId: (0, utils_1.getSessionId)({ moduleName, getConfiguration: utils_1.getConfiguration }),
    });
    utils_1.logger.info(`Config file path: ${configPath}`, {
        module: moduleName,
    });
    utils_1.logger.info(`Section of the config file to use: ${configSection}`, {
        module: moduleName,
    });
    const configuration = (0, utils_1.getConfiguration)({
        configurationFilePath: configPath,
        moduleName,
    });
    const sectionsArray = configSection.split('.');
    const config = (0, findConfigurationSection_1.default)(configuration, sectionsArray);
    if (!config) {
        throw new Error(`Section not found in configuration file!: ${configSection}`);
    }
    applyModuleRegistrations(config, modules);
    const container = (0, container_1.createAppContainer)(config);
    const apiAccessBootstrap = container.resolve('apiAccessBootstrap');
    await apiAccessBootstrap.initialize();
    const subscriptionManager = container.resolve('subscriptionManager');
    return {
        container,
        subscriptionManager,
        stop: async () => {
            if (typeof container.dispose === 'function') {
                await container.dispose();
            }
        },
    };
}
function applyModuleRegistrations(config, registrations) {
    if (!registrations.length) {
        return;
    }
    if (!Array.isArray(config.modules)) {
        config.modules = [];
    }
    for (const registration of registrations) {
        if (!registration.id || typeof registration.module !== 'function') {
            throw new Error('Invalid module registration');
        }
        let moduleConfig = config.modules.find((moduleConfig) => moduleConfig?.id === registration.id);
        if (!moduleConfig) {
            moduleConfig = { id: registration.id };
            config.modules.push(moduleConfig);
        }
        if (registration.config) {
            Object.assign(moduleConfig, registration.config);
        }
        moduleConfig.module_class = registration.module;
    }
}
exports.default = startService;
var base_1 = require("./Modules/base");
Object.defineProperty(exports, "GenericBaseModule", { enumerable: true, get: function () { return base_1.GenericBaseModule; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBNEJBLG9DQWdEQzs7QUExRUQsd0dBQXVFO0FBQ3ZFLDJDQUFnRDtBQUVoRCxtQ0FBZ0U7QUF1QnpELEtBQUssVUFBVSxZQUFZLENBQUMsT0FBNEI7SUFDN0QsTUFBTSxFQUNKLFVBQVUsRUFDVixhQUFhLEdBQUcsSUFBSSxFQUNwQixVQUFVLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksWUFBWSxFQUNqRCxPQUFPLEdBQUcsRUFBRSxHQUNiLEdBQUcsT0FBTyxDQUFBO0lBRVgsY0FBTSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRTtRQUNoQyxNQUFNLEVBQUUsVUFBVTtRQUNsQixTQUFTLEVBQUUsSUFBQSxvQkFBWSxFQUFDLEVBQUUsVUFBVSxFQUFFLGdCQUFnQixFQUFoQix3QkFBZ0IsRUFBRSxDQUFDO0tBQzFELENBQUMsQ0FBQTtJQUVGLGNBQU0sQ0FBQyxJQUFJLENBQUMscUJBQXFCLFVBQVUsRUFBRSxFQUFFO1FBQzdDLE1BQU0sRUFBRSxVQUFVO0tBQ25CLENBQUMsQ0FBQTtJQUNGLGNBQU0sQ0FBQyxJQUFJLENBQUMsc0NBQXNDLGFBQWEsRUFBRSxFQUFFO1FBQ2pFLE1BQU0sRUFBRSxVQUFVO0tBQ25CLENBQUMsQ0FBQTtJQUVGLE1BQU0sYUFBYSxHQUFHLElBQUEsd0JBQWdCLEVBQUM7UUFDckMscUJBQXFCLEVBQUUsVUFBVTtRQUNqQyxVQUFVO0tBQ1gsQ0FBQyxDQUFBO0lBQ0YsTUFBTSxhQUFhLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUM5QyxNQUFNLE1BQU0sR0FBRyxJQUFBLGtDQUF3QixFQUFDLGFBQWEsRUFBRSxhQUFhLENBQUMsQ0FBQTtJQUVyRSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDWixNQUFNLElBQUksS0FBSyxDQUFDLDZDQUE2QyxhQUFhLEVBQUUsQ0FBQyxDQUFBO0lBQy9FLENBQUM7SUFFRCx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUE7SUFFekMsTUFBTSxTQUFTLEdBQUcsSUFBQSw4QkFBa0IsRUFBQyxNQUFNLENBQUMsQ0FBQTtJQUM1QyxNQUFNLGtCQUFrQixHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQXFCLG9CQUFvQixDQUFDLENBQUE7SUFDdEYsTUFBTSxrQkFBa0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQTtJQUVyQyxNQUFNLG1CQUFtQixHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQXNCLHFCQUFxQixDQUFDLENBQUE7SUFFekYsT0FBTztRQUNMLFNBQVM7UUFDVCxtQkFBbUI7UUFDbkIsSUFBSSxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ2YsSUFBSSxPQUFPLFNBQVMsQ0FBQyxPQUFPLEtBQUssVUFBVSxFQUFFLENBQUM7Z0JBQzVDLE1BQU0sU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFBO1lBQzNCLENBQUM7UUFDSCxDQUFDO0tBQ0YsQ0FBQTtBQUNILENBQUM7QUFFRCxTQUFTLHdCQUF3QixDQUMvQixNQUEyQixFQUMzQixhQUFtQztJQUVuQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzFCLE9BQU07SUFDUixDQUFDO0lBRUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDbkMsTUFBTSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUE7SUFDckIsQ0FBQztJQUVELEtBQUssTUFBTSxZQUFZLElBQUksYUFBYSxFQUFFLENBQUM7UUFDekMsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLElBQUksT0FBTyxZQUFZLENBQUMsTUFBTSxLQUFLLFVBQVUsRUFBRSxDQUFDO1lBQ2xFLE1BQU0sSUFBSSxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQTtRQUNoRCxDQUFDO1FBRUQsSUFBSSxZQUFZLEdBQTZCLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUM5RCxDQUFDLFlBQTBCLEVBQUUsRUFBRSxDQUFDLFlBQVksRUFBRSxFQUFFLEtBQUssWUFBWSxDQUFDLEVBQUUsQ0FDckUsQ0FBQTtRQUVELElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNsQixZQUFZLEdBQUcsRUFBRSxFQUFFLEVBQUUsWUFBWSxDQUFDLEVBQUUsRUFBRSxDQUFBO1lBQ3RDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFBO1FBQ25DLENBQUM7UUFFRCxJQUFJLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUN4QixNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDbEQsQ0FBQztRQUVELFlBQVksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQTtJQUNqRCxDQUFDO0FBQ0gsQ0FBQztBQUVELGtCQUFlLFlBQVksQ0FBQTtBQUUzQix1Q0FBa0Q7QUFBekMseUdBQUEsaUJBQWlCLE9BQUEifQ==