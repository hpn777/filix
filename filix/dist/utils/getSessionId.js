"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionId = void 0;
const index_1 = require("./index");
const getSessionId = ({ moduleName, getConfiguration, } = {}) => {
    if (global.sessionId) {
        return global.sessionId;
    }
    if (moduleName) {
        return getSessionIdFromTheConfigFile({
            moduleName,
            getConfiguration,
        });
    }
    index_1.logger.error('Cannot retrieve Session ID', { module: moduleName });
    return null;
};
exports.getSessionId = getSessionId;
const getSessionIdFromTheConfigFile = ({ moduleName, getConfiguration, }) => {
    const config = getConfiguration?.({ moduleName });
    if (config?.services?.ui?.session_id) {
        global.sessionId = config.services.ui.session_id;
        return config.services.ui.session_id;
    }
    if (!config) {
        index_1.logger.error('Configuration not found in configuration file', {
            module: moduleName,
        });
    }
    index_1.logger.error('Session ID not found in configuration file', {
        module: moduleName,
    });
    return null;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0U2Vzc2lvbklkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL2dldFNlc3Npb25JZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFHQSxtQ0FBa0Q7QUFPM0MsTUFBTSxZQUFZLEdBQUcsQ0FBQyxFQUMzQixVQUFVLEVBQ1YsZ0JBQWdCLE1BQ2EsRUFBRSxFQUFpQixFQUFFO0lBQ2xELElBQUksTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3JCLE9BQU8sTUFBTSxDQUFDLFNBQVMsQ0FBQTtJQUN6QixDQUFDO0lBRUQsSUFBSSxVQUFVLEVBQUUsQ0FBQztRQUNmLE9BQU8sNkJBQTZCLENBQUM7WUFDbkMsVUFBVTtZQUNWLGdCQUFnQjtTQUNqQixDQUFDLENBQUE7SUFDSixDQUFDO0lBRUQsY0FBTSxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsRUFBRSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFBO0lBRWxFLE9BQU8sSUFBSSxDQUFBO0FBQ2IsQ0FBQyxDQUFBO0FBbEJZLFFBQUEsWUFBWSxnQkFrQnhCO0FBRUQsTUFBTSw2QkFBNkIsR0FBRyxDQUFDLEVBQ3JDLFVBQVUsRUFDVixnQkFBZ0IsR0FDQyxFQUFpQixFQUFFO0lBQ3BDLE1BQU0sTUFBTSxHQUFHLGdCQUFnQixFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFBO0lBRWpELElBQUksTUFBTSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLENBQUM7UUFDckMsTUFBTSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUE7UUFFaEQsT0FBTyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUE7SUFDdEMsQ0FBQztJQUVELElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNaLGNBQU0sQ0FBQyxLQUFLLENBQUMsK0NBQStDLEVBQUU7WUFDNUQsTUFBTSxFQUFFLFVBQVU7U0FDbkIsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVELGNBQU0sQ0FBQyxLQUFLLENBQUMsNENBQTRDLEVBQUU7UUFDekQsTUFBTSxFQUFFLFVBQVU7S0FDbkIsQ0FBQyxDQUFBO0lBRUYsT0FBTyxJQUFJLENBQUE7QUFDYixDQUFDLENBQUEifQ==