"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Module = void 0;
const tslib_1 = require("tslib");
const fs = tslib_1.__importStar(require("fs"));
const http = tslib_1.__importStar(require("http"));
const https = tslib_1.__importStar(require("https"));
const ws_1 = require("ws");
const base_1 = require("./base");
const logger_1 = require("../utils/logger");
class Module extends base_1.BaseModule {
    moduleName = 'WebSocketServer';
    constructor(config, subscriptionManager) {
        super(config, subscriptionManager);
    }
    init() {
        logger_1.logger.info('Module initialized', {
            module: this.moduleName,
        });
        const config = this.config;
        return new Promise((resolve, reject) => {
            if (config === undefined) {
                reject('Undefined config');
                return;
            }
            const app = this.createServer(config);
            const wss = this.setupWebSocketServer(app);
            resolve(this);
        });
    }
    createServer(config) {
        const host = config.host || '0.0.0.0';
        if (config.key && config.cert) {
            const sslConfig = {
                ...config,
                key: fs.readFileSync(config.key, 'utf8'),
                cert: fs.readFileSync(config.cert, 'utf8'),
                host,
            };
            return https.createServer(sslConfig).listen(sslConfig);
        }
        else {
            return http.createServer().listen({ ...config, host });
        }
    }
    setupWebSocketServer(app) {
        let seed = 1;
        const wss = new ws_1.WebSocketServer({ server: app });
        const connections = this.subscriptionManager.connections;
        logger_1.logger.info(`WebSocket started on port: ${this.config.port}`, {
            module: this.moduleName,
        });
        wss.on('connection', socket => {
            const connectionId = seed++;
            connections[connectionId] = socket;
            socket.on('message', message => {
                this.handleMessage(message, connectionId);
            });
            socket.on('close', () => {
                this.subscriptionManager.UnsubscribeClient(connectionId);
            });
            socket.on('error', error => {
                this.handleSocketError(error);
            });
        });
        return wss;
    }
    handleMessage(message, connectionId) {
        try {
            const request = JSON.parse(message.toString());
            request.clientId = connectionId;
            request.connectionType = 'ws';
            const command = this.subscriptionManager[request.serverCommand];
            if (typeof command === 'function') {
                command.call(this.subscriptionManager, request);
            }
            else {
                logger_1.logger.error(`Unknown command: ${request.serverCommand}`, {
                    module: this.moduleName,
                    availableCommands: Object.keys(this.subscriptionManager).filter(k => typeof this.subscriptionManager[k] === 'function'),
                });
            }
        }
        catch (error) {
            logger_1.logger.error(`Failed to handle WebSocket message: ${error}`, {
                module: this.moduleName,
                message: message.toString().substring(0, 100),
            });
        }
    }
    handleSocketError(error) {
        logger_1.logger.error(`WebSocket connection error: ${error}`, {
            module: this.moduleName,
        });
    }
}
exports.Module = Module;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2ViU29ja2V0U2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL01vZHVsZXMvV2ViU29ja2V0U2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSwrQ0FBd0I7QUFDeEIsbURBQTRCO0FBQzVCLHFEQUE4QjtBQUM5QiwyQkFBb0M7QUFFcEMsaUNBQW1DO0FBRW5DLDRDQUF3QztBQUV4QyxNQUFhLE1BQU8sU0FBUSxpQkFBVTtJQUNwQyxVQUFVLEdBQVcsaUJBQWlCLENBQUE7SUFFdEMsWUFBbUIsTUFBVyxFQUFFLG1CQUF3QztRQUN0RSxLQUFLLENBQUMsTUFBTSxFQUFFLG1CQUFtQixDQUFDLENBQUE7SUFDcEMsQ0FBQztJQUVNLElBQUk7UUFDVCxlQUFNLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFO1lBQ2hDLE1BQU0sRUFBRSxJQUFJLENBQUMsVUFBVTtTQUN4QixDQUFDLENBQUE7UUFFRixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFBO1FBQzFCLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDckMsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQ3pCLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO2dCQUMxQixPQUFNO1lBQ1IsQ0FBQztZQUVELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUE7WUFDckMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBRTFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUNmLENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVPLFlBQVksQ0FBQyxNQUFXO1FBQzlCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksU0FBUyxDQUFBO1FBRXJDLElBQUksTUFBTSxDQUFDLEdB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