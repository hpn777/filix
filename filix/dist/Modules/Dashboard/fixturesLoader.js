"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadDashboardFixtures = void 0;
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const logger_1 = require("../../utils/logger");
const uiModuleLoader_1 = require("./uiModuleLoader");
const loadDashboardFixtures = (moduleName, configuredPath) => {
    const fixturesPath = resolveFixturesPath(moduleName, configuredPath);
    return {
        path: fixturesPath,
        controlPresets: loadJson(fixturesPath, 'control_preset.json', moduleName) ?? [],
        tabPresets: loadJson(fixturesPath, 'tab_preset.json', moduleName) ?? [],
        uiModules: (0, uiModuleLoader_1.uiModuleLoader)(fixturesPath),
    };
};
exports.loadDashboardFixtures = loadDashboardFixtures;
const resolveFixturesPath = (moduleName, configuredPath) => {
    if (configuredPath) {
        const absolutePath = path_1.default.isAbsolute(configuredPath)
            ? configuredPath
            : path_1.default.resolve(process.cwd(), configuredPath);
        if (fs_1.default.existsSync(absolutePath)) {
            return absolutePath;
        }
        logger_1.logger.warn(`Configured fixtures path not found: ${absolutePath}. Falling back to default.`, {
            module: moduleName,
        });
    }
    return path_1.default.resolve(__dirname, '../../fixtures');
};
const loadJson = (fixturesPath, fileName, moduleName) => {
    const filePath = path_1.default.resolve(fixturesPath, fileName);
    if (!fs_1.default.existsSync(filePath)) {
        logger_1.logger.warn(`Dashboard fixture not found: ${filePath}`, {
            module: moduleName,
        });
        return null;
    }
    try {
        const content = fs_1.default.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    }
    catch (error) {
        logger_1.logger.error(`Failed to load fixture ${filePath}: ${error}`, {
            module: moduleName,
        });
        return null;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZml4dHVyZXNMb2FkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvTW9kdWxlcy9EYXNoYm9hcmQvZml4dHVyZXNMb2FkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLG9EQUFtQjtBQUNuQix3REFBdUI7QUFFdkIsK0NBQTJDO0FBQzNDLHFEQUFpRDtBQVMxQyxNQUFNLHFCQUFxQixHQUFHLENBQ25DLFVBQWtCLEVBQ2xCLGNBQXVCLEVBQ0osRUFBRTtJQUNyQixNQUFNLFlBQVksR0FBRyxtQkFBbUIsQ0FBQyxVQUFVLEVBQUUsY0FBYyxDQUFDLENBQUE7SUFFcEUsT0FBTztRQUNMLElBQUksRUFBRSxZQUFZO1FBQ2xCLGNBQWMsRUFBRSxRQUFRLENBQUMsWUFBWSxFQUFFLHFCQUFxQixFQUFFLFVBQVUsQ0FBQyxJQUFJLEVBQUU7UUFDL0UsVUFBVSxFQUFFLFFBQVEsQ0FBQyxZQUFZLEVBQUUsaUJBQWlCLEVBQUUsVUFBVSxDQUFDLElBQUksRUFBRTtRQUN2RSxTQUFTLEVBQUUsSUFBQSwrQkFBYyxFQUFDLFlBQVksQ0FBQztLQUN4QyxDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBWlksUUFBQSxxQkFBcUIseUJBWWpDO0FBRUQsTUFBTSxtQkFBbUIsR0FBRyxDQUFDLFVBQWtCLEVBQUUsY0FBdUIsRUFBVSxFQUFFO0lBQ2xGLElBQUksY0FBYyxFQUFFLENBQUM7UUFDbkIsTUFBTSxZQUFZLEdBQUcsY0FBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUM7WUFDbEQsQ0FBQyxDQUFDLGNBQWM7WUFDaEIsQ0FBQyxDQUFDLGNBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLGNBQWMsQ0FBQyxDQUFBO1FBRS9DLElBQUksWUFBRSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDO1lBQ2hDLE9BQU8sWUFBWSxDQUFBO1FBQ3JCLENBQUM7UUFFRCxlQUFNLENBQUMsSUFBSSxDQUFDLHVDQUF1QyxZQUFZLDRCQUE0QixFQUFFO1lBQzNGLE1BQU0sRUFBRSxVQUFVO1NBQ25CLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFFRCxPQUFPLGNBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLGdCQUFnQixDQUFDLENBQUE7QUFDbEQsQ0FBQyxDQUFBO0FBRUQsTUFBTSxRQUFRLEdBQUcsQ0FBVSxZQUFvQixFQUFFLFFBQWdCLEVBQUUsVUFBa0IsRUFBWSxFQUFFO0lBQ2pHLE1BQU0sUUFBUSxHQUFHLGNBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0lBRXJELElBQUksQ0FBQyxZQUFFLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7UUFDN0IsZUFBTSxDQUFDLElBQUksQ0FBQyxnQ0FBZ0MsUUFBUSxFQUFFLEVBQUU7WUFDdEQsTUFBTSxFQUFFLFVBQVU7U0FDbkIsQ0FBQyxDQUFBO1FBQ0YsT0FBTyxJQUFJLENBQUE7SUFDYixDQUFDO0lBRUQsSUFBSSxDQUFDO1FBQ0gsTUFBTSxPQUFPLEdBQUcsWUFBRSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUE7UUFDakQsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBTSxDQUFBO0lBQ2pDLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsZUFBTSxDQUFDLEtBQUssQ0FBQywwQkFBMEIsUUFBUSxLQUFLLEtBQUssRUFBRSxFQUFFO1lBQzNELE1BQU0sRUFBRSxVQUFVO1NBQ25CLENBQUMsQ0FBQTtRQUNGLE9BQU8sSUFBSSxDQUFBO0lBQ2IsQ0FBQztBQUNILENBQUMsQ0FBQSJ9