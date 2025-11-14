"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const tslib_1 = require("tslib");
const winston_1 = require("winston");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const { format } = require('winston');
const { combine, timestamp, printf, metadata } = format;
function transformDate(timestamp) {
    const date = new Date(timestamp);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    const milliseconds = date.getUTCMilliseconds();
    const nanoseconds = String(milliseconds).padStart(3, '0') + '000000';
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${nanoseconds}`;
}
var CustomLevelsEnum;
(function (CustomLevelsEnum) {
    CustomLevelsEnum["INIT"] = "init";
    CustomLevelsEnum["CRITICAL"] = "critical";
    CustomLevelsEnum["ERROR"] = "error";
    CustomLevelsEnum["WARN"] = "warn";
    CustomLevelsEnum["INFO"] = "info";
    CustomLevelsEnum["DEBUG"] = "debug";
    CustomLevelsEnum["VERBOSE1"] = "verbose1";
    CustomLevelsEnum["VERBOSE2"] = "verbose2";
    CustomLevelsEnum["VERBOSE3"] = "verbose3";
    CustomLevelsEnum["VERBOSE4"] = "verbose4";
    CustomLevelsEnum["VERBOSE5"] = "verbose5";
    CustomLevelsEnum["VERBOSE6"] = "verbose6";
    CustomLevelsEnum["VERBOSE7"] = "verbose7";
    CustomLevelsEnum["VERBOSE8"] = "verbose8";
    CustomLevelsEnum["VERBOSE9"] = "verbose9";
    CustomLevelsEnum["VERBOSE10"] = "verbose10";
})(CustomLevelsEnum || (CustomLevelsEnum = {}));
const customFormat = printf(({ timestamp, level, message, stack, module, sessionId, objectOrArray, }) => {
    const formattedTimestamp = `[${transformDate(timestamp)}]`;
    const formattedModule = module ? `[${module}]` : '[no_module]';
    const formattedLevel = `[${lodash_1.default.capitalize(level)}]`;
    const formattedObjectOrArray = objectOrArray
        ? `\n${JSON.stringify(objectOrArray)}`
        : '';
    const formattedMessage = `${message}${formattedObjectOrArray}`;
    if (level === CustomLevelsEnum.INIT) {
        const formattedSessionID = sessionId
            ? `session_id: ${sessionId}`
            : 'session_id: no_session_id';
        return `${formattedTimestamp} ${formattedLevel} ${formattedModule} ${formattedMessage} (${formattedSessionID})`;
    }
    if (level === CustomLevelsEnum.ERROR) {
        const formattedStack = stack ? `\n${stack}` : '';
        return `${formattedTimestamp} ${formattedLevel} ${formattedModule} ${formattedMessage}${formattedStack}`;
    }
    return `${formattedTimestamp} ${formattedLevel} ${formattedModule} ${formattedMessage}`;
});
const customLevels = {
    levels: {
        init: 0,
        critical: 1,
        error: 2,
        warn: 3,
        info: 4,
        debug: 5,
        verbose1: 6,
        verbose2: 7,
        verbose3: 8,
        verbose4: 9,
        verbose5: 10,
        verbose6: 11,
        verbose7: 12,
        verbose8: 13,
        verbose9: 14,
        verbose10: 15,
    },
};
exports.logger = (0, winston_1.createLogger)({
    levels: customLevels.levels,
    transports: [
        new winston_1.transports.Console(),
        new winston_1.transports.File({
            filename: 'logs/filix.all.log',
            level: 'verbose10',
        }),
        new winston_1.transports.File({
            filename: 'logs/filix.log',
            level: 'info',
        }),
        new winston_1.transports.File({
            filename: 'logs/filix.error.log',
            level: 'error',
        }),
    ],
    exceptionHandlers: [new winston_1.transports.Console()],
    format: combine(timestamp(), customFormat, metadata()),
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL2xvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEscUNBS2dCO0FBRWhCLDREQUFzQjtBQUd0QixNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQ3JDLE1BQU0sRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLENBQUE7QUFFdkQsU0FBUyxhQUFhLENBQUMsU0FBaUI7SUFDdEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7SUFFaEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFBO0lBQ2xDLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUM3RCxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUV0RCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUN6RCxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUM3RCxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUU3RCxNQUFNLFlBQVksR0FB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