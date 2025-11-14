"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStdoutLogger = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["Init"] = 1] = "Init";
    LogLevel[LogLevel["Critical"] = 2] = "Critical";
    LogLevel[LogLevel["Error"] = 4] = "Error";
    LogLevel[LogLevel["Warning"] = 8] = "Warning";
    LogLevel[LogLevel["Info"] = 16] = "Info";
    LogLevel[LogLevel["Debug"] = 32] = "Debug";
    LogLevel[LogLevel["Verbose_1"] = 64] = "Verbose_1";
    LogLevel[LogLevel["Verbose_2"] = 128] = "Verbose_2";
    LogLevel[LogLevel["Verbose_3"] = 256] = "Verbose_3";
    LogLevel[LogLevel["Verbose_4"] = 512] = "Verbose_4";
    LogLevel[LogLevel["Verbose_5"] = 1024] = "Verbose_5";
    LogLevel[LogLevel["Verbose_6"] = 2048] = "Verbose_6";
    LogLevel[LogLevel["Verbose_7"] = 4096] = "Verbose_7";
    LogLevel[LogLevel["Verbose_8"] = 8192] = "Verbose_8";
    LogLevel[LogLevel["Verbose_9"] = 16384] = "Verbose_9";
    LogLevel[LogLevel["Verbose_10"] = 32768] = "Verbose_10";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
const createStdoutLogger = (debugLevel) => ({
    setLevel(level) {
        debugLevel = level;
    },
    getLevel() {
        return debugLevel;
    },
    log(level, msg) {
        level & debugLevel && this.logUnfiltered(level, msg);
    },
    logUnfiltered(level, msg) {
        const date = new Date();
        const dateString = date.toUTCString().split(' ');
        const milliseconds = date.getMilliseconds() * 1000;
        process.stdout.write(`${process.env.HOSTNAME || '127.0.0.1'} [${dateString[2]} ${dateString[1]} ${dateString[4]}.${milliseconds}] [${LogLevel[level]}] ${msg}\n`);
    },
});
exports.createStdoutLogger = createStdoutLogger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL01vZHVsZXMvdXRpbHMvbG9nZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLElBQVksUUFpQlg7QUFqQkQsV0FBWSxRQUFRO0lBQ2xCLHVDQUFRLENBQUE7SUFDUiwrQ0FBaUIsQ0FBQTtJQUNqQix5Q0FBYyxDQUFBO0lBQ2QsNkNBQWdCLENBQUE7SUFDaEIsd0NBQWEsQ0FBQTtJQUNiLDBDQUFjLENBQUE7SUFDZCxrREFBa0IsQ0FBQTtJQUNsQixtREFBa0IsQ0FBQTtJQUNsQixtREFBa0IsQ0FBQTtJQUNsQixtREFBa0IsQ0FBQTtJQUNsQixvREFBbUIsQ0FBQTtJQUNuQixvREFBbUIsQ0FBQTtJQUNuQixvREFBbUIsQ0FBQTtJQUNuQixvREFBbUIsQ0FBQTtJQUNuQixxREFBbUIsQ0FBQTtJQUNuQix1REFBb0IsQ0FBQTtBQUN0QixDQUFDLEVBakJXLFFBQVEsd0JBQVIsUUFBUSxRQWlCbkI7QUFXTSxNQUFNLGtCQUFrQixHQUFHLENBQUMsVUFBMkIsRUFBVSxFQUFFLENBQUMsQ0FBQztJQUMxRSxRQUFRLENBQUMsS0FBc0I7UUFDN0IsVUFBVSxHQUFHLEtBQUssQ0FBQTtJQUNwQixDQUFDO0lBRUQsUUFBUTtRQUNOLE9BQU8sVUFBVSxDQUFBO0lBQ25CLENBQUM7SUFFRCxHQUFHLENBQUMsS0FBZSxFQUFFLEdBQVc7UUFHOUIsS0FBSyxHQUFHLFVBQVUsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUN0RCxDQUFDO0lBR0QsYUFBYSxDQUFDLEtBQWUsRUFBRSxHQUFXO1FBQ3hDLE1BQU0sSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUE7UUFDdkIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNoRCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsZUFBZSxFQUFFLEdBQUcsSUFBSSxDQUFBO1FBQ2xELE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUNsQixHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLFdBQVcsS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQ3RELFVBQVUsQ0FBQyxDQUFDLENBQ2QsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksWUFBWSxNQUFNLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FDbkUsQ0FBQTtJQUNILENBQUM7Q0FDRixDQUFDLENBQUE7QUExQlcsUUFBQSxrQkFBa0Isc0JBMEI3QiJ9