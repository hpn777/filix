"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Error.stackTraceLimit = 50;
const argparse_1 = require("argparse");
const _1 = require(".");
const utils_1 = require("./utils");
const moduleName = process.env.HOSTNAME || 'AppService';
const parser = new argparse_1.ArgumentParser();
parser.add_argument('-c', '--config', {
    help: 'Sets a custom config file path (default: ./config/all.yml)',
});
parser.add_argument('-s', '--config-section', {
    help: 'Section of the config file to use (default: ui)',
});
const args = parser.parse_args();
const configurationFilePath = args.config || './config/all.yml';
const configurationSection = args.config_section || 'ui';
const runOnProgramExit = (callback, delay = 0) => {
    const handler = () => {
        const execute = () => {
            Promise.resolve(callback()).finally(() => process.exit(0));
        };
        if (delay > 0) {
            setTimeout(execute, delay);
        }
        else {
            execute();
        }
    };
    ['SIGTERM', 'SIGINT'].forEach(signal => process.once(signal, handler));
};
const main = async () => {
    try {
        const service = await (0, _1.startService)({
            configPath: configurationFilePath,
            configSection: configurationSection,
            moduleName,
        });
        runOnProgramExit(service.stop, 200);
    }
    catch (error) {
        utils_1.logger.error(`API service failed to start: ${error}`, {
            module: moduleName,
        });
        process.exit(1);
    }
};
void main();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLEtBQUssQ0FBQyxlQUFlLEdBQUcsRUFBRSxDQUFBO0FBRTFCLHVDQUF5QztBQUN6Qyx3QkFBZ0M7QUFDaEMsbUNBQWdDO0FBRWhDLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLFlBQVksQ0FBQTtBQUV2RCxNQUFNLE1BQU0sR0FBRyxJQUFJLHlCQUFjLEVBQUUsQ0FBQTtBQUVuQyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUU7SUFDcEMsSUFBSSxFQUFFLDREQUE0RDtDQUNuRSxDQUFDLENBQUE7QUFDRixNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRTtJQUM1QyxJQUFJLEVBQUUsaURBQWlEO0NBQ3hELENBQUMsQ0FBQTtBQUVGLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQTtBQUVoQyxNQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQyxNQUFNLElBQUksa0JBQWtCLENBQUE7QUFDL0QsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQTtBQUV4RCxNQUFNLGdCQUFnQixHQUFHLENBQ3ZCLFFBQW9DLEVBQ3BDLEtBQUssR0FBRyxDQUFDLEVBQ0gsRUFBRTtJQUNSLE1BQU0sT0FBTyxHQUFHLEdBQUcsRUFBRTtRQUNuQixNQUFNLE9BQU8sR0FBRyxHQUFHLEVBQUU7WUFDbkIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDNUQsQ0FBQyxDQUFBO1FBRUQsSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDZCxVQUFVLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFBO1FBQzVCLENBQUM7YUFBTSxDQUFDO1lBQ04sT0FBTyxFQUFFLENBQUE7UUFDWCxDQUFDO0lBQ0gsQ0FBQyxDQUVBO0lBQUEsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQTtBQUN6RSxDQUFDLENBQUE7QUFFRCxNQUFNLElBQUksR0FBRyxLQUFLLElBQUksRUFBRTtJQUN0QixJQUFJLENBQUM7UUFDSCxNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUEsZUFBWSxFQUFDO1lBQ2pDLFVBQVUsRUFBRSxxQkFBcUI7WUFDakMsYUFBYSxFQUFFLG9CQUFvQjtZQUNuQyxVQUFVO1NBQ1gsQ0FBQyxDQUFBO1FBRUYsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUNyQyxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLGNBQU0sQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLEtBQUssRUFBRSxFQUFFO1lBQ3BELE1BQU0sRUFBRSxVQUFVO1NBQ25CLENBQUMsQ0FBQTtRQUNGLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDakIsQ0FBQztBQUNILENBQUMsQ0FBQTtBQUVELEtBQUssSUFBSSxFQUFFLENBQUEifQ==