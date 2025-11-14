"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfiguration = void 0;
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const js_yaml_1 = tslib_1.__importDefault(require("js-yaml"));
const index_1 = require("./index");
function replaceEnvVars(str) {
    return str.replace(/\$\{([^}:]+)(?::(-[^}]+))?\}/g, (match, varName, defaultValue) => {
        const value = process.env[varName];
        if (value !== undefined) {
            return value;
        }
        if (defaultValue !== undefined) {
            return defaultValue.substring(1);
        }
        return match;
    });
}
function substituteEnvVars(obj) {
    if (typeof obj === 'string') {
        return replaceEnvVars(obj);
    }
    if (Array.isArray(obj)) {
        return obj.map(substituteEnvVars);
    }
    if (obj && typeof obj === 'object') {
        const result = {};
        for (const key in obj) {
            result[key] = substituteEnvVars(obj[key]);
        }
        return result;
    }
    return obj;
}
const getConfiguration = ({ configurationFilePath = './config/all.yml', moduleName, } = {}) => {
    try {
        const fileContent = fs_1.default.readFileSync(configurationFilePath, 'utf8');
        const config = js_yaml_1.default.load(fileContent) || null;
        return config ? substituteEnvVars(config) : null;
    }
    catch (error) {
        index_1.logger.error(`Error while reading configuration file ${error}`, {
            module: moduleName,
        });
    }
};
exports.getConfiguration = getConfiguration;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0Q29uZmlndXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9nZXRDb25maWd1cmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxvREFBbUI7QUFFbkIsOERBQTBCO0FBRzFCLG1DQUFnQztBQVdoQyxTQUFTLGNBQWMsQ0FBQyxHQUFXO0lBQ2pDLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQywrQkFBK0IsRUFBRSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLEVBQUU7UUFDbkYsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUNsQyxJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUN4QixPQUFPLEtBQUssQ0FBQTtRQUNkLENBQUM7UUFDRCxJQUFJLFlBQVksS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUMvQixPQUFPLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbEMsQ0FBQztRQUNELE9BQU8sS0FBSyxDQUFBO0lBQ2QsQ0FBQyxDQUFDLENBQUE7QUFDSixDQUFDO0FBS0QsU0FBUyxpQkFBaUIsQ0FBQyxHQUFRO0lBQ2pDLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDNUIsT0FBTyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDNUIsQ0FBQztJQUNELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ3ZCLE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO0lBQ25DLENBQUM7SUFDRCxJQUFJLEdBQUcsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUUsQ0FBQztRQUNuQyxNQUFNLE1BQU0sR0FBUSxFQUFFLENBQUE7UUFDdEIsS0FBSyxNQUFNLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUN0QixNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsaUJBQWlCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7UUFDM0MsQ0FBQztRQUNELE9BQU8sTUFBTSxDQUFBO0lBQ2YsQ0FBQztJQUNELE9BQU8sR0FBRyxDQUFBO0FBQ1osQ0FBQztBQUVNLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxFQUMvQixxQkFBcUIsR0FBRyxrQkFBa0IsRUFDMUMsVUFBVSxNQUN1QixFQUFFLEVBQWtDLEVBQUU7SUFDdkUsSUFBSSxDQUFDO1FBQ0gsTUFBTSxXQUFXLEdBQUcsWUFBRSxDQUFDLFlBQVksQ0FBQyxxQkFBcUIsRUFBRSxNQUFNLENBQUMsQ0FBQTtRQUNsRSxNQUFNLE1BQU0sR0FBRyxpQkFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxJQUFJLENBQUE7UUFHN0MsT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUE7SUFDbEQsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDZixjQUFNLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxLQUFLLEVBQUUsRUFBRTtZQUM5RCxNQUFNLEVBQUUsVUFBVTtTQUNuQixDQUFDLENBQUE7SUFDSixDQUFDO0FBQ0gsQ0FBQyxDQUFBO0FBZlksUUFBQSxnQkFBZ0Isb0JBZTVCIn0=