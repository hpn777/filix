"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Module = void 0;
const tslib_1 = require("tslib");
const os_1 = tslib_1.__importDefault(require("os"));
const base_1 = require("../base");
const TcpCommandPort_1 = require("./TcpCommandPort");
const logger_1 = require("../../utils/logger");
class Module extends base_1.BaseModule {
    init() {
        new TcpCommandPort_1.TcpCommandPort(this.config, this);
        setInterval(() => {
            this.resendStatus();
        }, 60000);
        return new Promise((resolve, reject) => {
            resolve(this);
        });
    }
    GetStatus(request, subscription) {
        subscription.publish(this.getStatus(), request.requestId);
    }
    getStatus() {
        return {
            hostName: this.getHostname(),
            processUptime: this.formatUptime(process.uptime()),
            memoryUsage: process.memoryUsage(),
            modules: this.getModulesList(),
        };
    }
    formatUptime(totalSec) {
        const days = Math.floor(totalSec / 86400);
        const hours = Math.floor((totalSec / 3600) % 24);
        const minutes = Math.floor((totalSec / 60) % 60);
        const seconds = Math.floor(totalSec % 60);
        return `${days}d. ${hours}h. ${minutes}m. ${seconds}s.`;
    }
    getHostname() {
        if (process.env.HOSTNAME) {
            return process.env.HOSTNAME;
        }
        const ifaces = os_1.default.networkInterfaces();
        if (ifaces.eth0 && ifaces.eth0.length > 0) {
            return ifaces.eth0[0].address;
        }
        return '0.0.0.0';
    }
    getModulesList() {
        const modules = [];
        for (const [attr, module] of Object.entries(this.subscriptionManager.modules)) {
            if (!module.config.private && module.publicMethods) {
                modules.push({
                    moduleId: attr,
                    publicMethods: Object.keys(module.publicMethods),
                });
            }
        }
        return modules;
    }
    reset() {
        logger_1.logger.info('Service has been terminated using command port.', {
            module: 'ServerManager',
        });
        process.kill(process.pid, 'SIGTERM');
    }
    resendStatus() {
        const { subscriptions } = this.subscriptionManager;
        const status = this.getStatus();
        subscriptions.each((subscription) => {
            if (subscription.get('moduleId') == 'ServerManager') {
                subscription.publish(status, subscription.requestId);
            }
        });
    }
}
exports.Module = Module;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvTW9kdWxlcy9TZXJ2ZXJNYW5hZ2VyL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFDQSxvREFBbUI7QUFFbkIsa0NBQW9DO0FBQ3BDLHFEQUFpRDtBQUNqRCwrQ0FBMkM7QUFFM0MsTUFBYSxNQUFPLFNBQVEsaUJBQVU7SUFDcEMsSUFBSTtRQUNGLElBQUksK0JBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFBO1FBRXJDLFdBQVcsQ0FBQyxHQUFHLEVBQUU7WUFDZixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUE7UUFDckIsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFBO1FBRVQsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUNyQyxPQUFPLENBQUMsSUFBa0IsQ0FBQyxDQUFBO1FBQzdCLENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVELFNBQVMsQ0FBQyxPQUFPLEVBQUUsWUFBMEI7UUFDM0MsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0lBQzNELENBQUM7SUFFRCxTQUFTO1FBQ1AsT0FBTztZQUNMLFFBQVEsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQzVCLGFBQWEsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNsRCxXQUFXLEVBQUUsT0FBTyxDQUFDLFdBQVcsRUFBRTtZQUNsQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRTtTQUMvQixDQUFBO0lBQ0gsQ0FBQztJQUVPLFlBQVksQ0FBQyxRQUFnQjtRQUNuQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsQ0FBQTtRQUN6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