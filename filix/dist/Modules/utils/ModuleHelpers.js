"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleHelpers = void 0;
const tslib_1 = require("tslib");
const os = tslib_1.__importStar(require("os"));
class ModuleHelpers {
    static getTesseract(evH, tableName, subscription, errorMessage) {
        const tesseract = evH.get(tableName);
        if (!tesseract) {
            const message = errorMessage || `${tableName} tesseract not found`;
            subscription.publishError({ message }, subscription.requestId);
            return null;
        }
        return tesseract;
    }
    static publishSuccess(subscription, requestId, data) {
        subscription.publish(data ?? null, requestId);
    }
    static setupSession(tesseract, config, subscription, request) {
        const session = tesseract.createSession(config);
        session.on('dataUpdate', (data) => {
            subscription.publish(data.toJSON(), request.requestId);
        }, subscription);
        subscription.on('remove', () => {
            session.destroy();
        });
        subscription.publish({
            addedData: session.getData(),
        }, request.requestId);
        return session;
    }
    static getHostAddress(config) {
        if (config.hostName) {
            return config.hostName;
        }
        if (config.host && config.host !== '0.0.0.0') {
            return config.host;
        }
        if (config.interface) {
            const ifaces = os.networkInterfaces();
            const iface = ifaces[config.interface];
            if (iface && iface.length > 0) {
                return iface[0].address;
            }
        }
        const ifaces = os.networkInterfaces();
        if (ifaces.eth0 && ifaces.eth0.length > 0) {
            return ifaces.eth0[0].address;
        }
        return '0.0.0.0';
    }
    static splitMessage(message) {
        if (message.indexOf('\r\n') > 0) {
            return message.split('\r\n');
        }
        return message.split('\n');
    }
    static async getModule(subscriptionManager, moduleName) {
        try {
            if (typeof subscriptionManager.resolveModule !== 'function') {
                throw new Error('Subscription manager does not support resolveModule');
            }
            return await subscriptionManager.resolveModule(moduleName);
        }
        catch (error) {
            throw new Error(`Failed to load module '${moduleName}': ${error}`);
        }
    }
}
exports.ModuleHelpers = ModuleHelpers;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9kdWxlSGVscGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9Nb2R1bGVzL3V0aWxzL01vZHVsZUhlbHBlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQVNBLCtDQUF3QjtBQXFCeEIsTUFBYSxhQUFhO0lBSXhCLE1BQU0sQ0FBQyxZQUFZLENBQ2pCLEdBQVksRUFDWixTQUFpQixFQUNqQixZQUEwQixFQUMxQixZQUFxQjtRQUVyQixNQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFBO1FBQ3BDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNmLE1BQU0sT0FBTyxHQUFHLFlBQVksSUFBSSxHQUFHLFNBQVMsc0JBQXNCLENBQUE7WUFDbEUsWUFBWSxDQUFDLFlBQVksQ0FBQyxFQUFFLE9BQU8sRUFBRSxFQUFFLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQTtZQUM5RCxPQUFPLElBQUksQ0FBQTtRQUNiLENBQUM7UUFDRCxPQUFPLFNBQVMsQ0FBQTtJQUNsQixDQUFDO0lBS0QsTUFBTSxDQUFDLGNBQWMsQ0FDbkIsWUFBMEIsRUFDMUIsU0FBaUIsRUFDakIsSUFBYztRQUVkLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQTtJQUMvQyxDQUFDO0lBS0QsTUFBTSxDQUFDLFlBQVksQ0FDakIsU0FBb0IsRUFDcEIsTUFBK0IsRUFDL0IsWUFBMEIsRUFDMUIsT0FBOEI7UUFFOUIsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUUvQyxPQUFPLENBQUMsRUFBRSxDQUNSLFlBQVksRUFDWixDQUFDLElBQXFCLEVBQUUsRUFBRTtZQUN4QixZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUE7UUFDeEQsQ0FB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