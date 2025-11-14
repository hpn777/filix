"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TcpCommandPort = void 0;
const tslib_1 = require("tslib");
const net = tslib_1.__importStar(require("net"));
const tessio_1 = require("tessio");
const collection_1 = require("../../Model/collection");
const logger_1 = require("../../utils/logger");
const ModuleHelpers_1 = require("../utils/ModuleHelpers");
class TcpCommandPort {
    config;
    serverManager;
    HOST;
    moduleName = 'TcpCommandPort';
    constructor(config, serverManager) {
        this.config = config;
        this.serverManager = serverManager;
        logger_1.logger.info('Module initialized', {
            module: this.moduleName,
        });
        const connectionSessions = new collection_1.Collection();
        const HOST = ModuleHelpers_1.ModuleHelpers.getHostAddress(config);
        this.HOST = process.env.HOSTNAME || HOST;
        const PORT = config.port || process.env.COMMAND_PORT || 1100;
        const SLICE = config.slice || process.env.SLICENO || 0;
        const welcomeMessage = `#appService@${this.HOST}(${SLICE}): `;
        net
            .createServer(connection => {
            logger_1.logger.info(`Client connected to Command Port: ${connection.remoteAddress}:${connection.remotePort}`, { module: this.moduleName });
            connectionSessions.set(connection);
            connection.write(welcomeMessage);
            connection.on('data', data => {
                const message = data.toString();
                this.processRequest(message, (err, response) => {
                    if (response) {
                        connection.write(`${response}\r\n${welcomeMessage}`);
                    }
                });
            });
            connection.on('error', data => {
                logger_1.logger.error('Comand Port error:', {
                    module: this.moduleName,
                    objectOrArray: data,
                });
            });
        })
            .listen(PORT, HOST, () => {
            logger_1.logger.info(`Command Port started on: ${HOST}:${PORT}`, {
                module: this.moduleName,
            });
        });
    }
    processRequest(message, callbackFn) {
        const messagesArray = ModuleHelpers_1.ModuleHelpers.splitMessage(message);
        tessio_1.lodash.each(messagesArray, (item) => {
            if (item) {
                const response = this.processCommand(item);
                callbackFn(null, response);
            }
        });
    }
    processCommand(item) {
        const messageArray = item.split(' ');
        if (!messageArray.length) {
            return '';
        }
        const command = messageArray[0];
        const args = messageArray.slice(1);
        switch (command) {
            case 'status':
                return this.handleStatusCommand();
            case 'ls':
            case 'help':
                return this.handleHelpCommand();
            case 'restart':
                return this.handleRestartCommand(args);
            default:
                return 'Unrecognized command.';
        }
    }
    handleStatusCommand() {
        const status = this.serverManager.getStatus();
        return `Up time: ${status.processUptime}\r\nMemory usage: ${JSON.stringify(status.memoryUsage)}\r\n`;
    }
    handleHelpCommand() {
        return 'status - service status\r\nls - available commands\r\nrestart = kill service\r\n';
    }
    handleRestartCommand(args) {
        if (args[0] && args[0] === this.HOST) {
            this.serverManager.reset();
            return '';
        }
        return 'Invalid host name.';
    }
}
exports.TcpCommandPort = TcpCommandPort;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGNwQ29tbWFuZFBvcnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvTW9kdWxlcy9TZXJ2ZXJNYW5hZ2VyL1RjcENvbW1hbmRQb3J0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxpREFBMEI7QUFFMUIsbUNBQW9DO0FBR3BDLHVEQUFtRDtBQUNuRCwrQ0FBMkM7QUFDM0MsMERBQXNEO0FBRXRELE1BQWEsY0FBYztJQUlOO0lBQW9DO0lBSHZELElBQUksQ0FBQTtJQUNKLFVBQVUsR0FBVyxnQkFBZ0IsQ0FBQTtJQUVyQyxZQUFtQixNQUEyQixFQUFTLGFBQTRCO1FBQWhFLFdBQU0sR0FBTixNQUFNLENBQXFCO1FBQVMsa0JBQWEsR0FBYixhQUFhLENBQWU7UUFDakYsZUFBTSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRTtZQUNoQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVU7U0FDeEIsQ0FBQyxDQUFBO1FBRUYsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLHVCQUFVLEVBQUUsQ0FBQTtRQUUzQyxNQUFNLElBQUksR0FBRyw2QkFBYSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUNqRCxJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQTtRQUV4QyxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQTtRQUM1RCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQTtRQUV0RCxNQUFNLGNBQWMsR0FBRyxlQUFlLElBQUksQ0FBQyxJQUFJLElBQUksS0FBSyxLQUFLLENBQUE7UUFFN0QsR0FBRzthQUNBLFlBQVksQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUN6QixlQUFNLENBQUMsSUFB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