"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UdpDiscovery = void 0;
const tslib_1 = require("tslib");
const dgram = tslib_1.__importStar(require("dgram"));
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const generateGuid_1 = require("../utils/generateGuid");
class UdpDiscovery {
    udpEndPoint;
    all$;
    message$;
    error$;
    config;
    constructor(config) {
        this.config = config;
        this.udpEndPoint = dgram.createSocket('udp4');
        this.udpEndPoint.on('error', (err) => {
            console.log(err);
        });
        this.all$ = (0, rxjs_1.fromEvent)(this.udpEndPoint, 'message').pipe((0, operators_1.map)((msg) => {
            try {
                const response = {
                    data: JSON.parse(msg[0].toString()),
                    sender: msg[1],
                    success: true,
                };
                return response;
            }
            catch (ex) {
                return {
                    data: null,
                    sender: msg[1],
                    success: false,
                    error: ex,
                };
            }
        }));
        this.message$ = this.all$.pipe((0, operators_1.filter)((response) => response.success));
        this.error$ = this.all$.pipe((0, operators_1.filter)((response) => !response.success));
        this.udpEndPoint.bind(config.udpPort, 'localhost');
        this.udpEndPoint.on('listening', () => {
            console.info(`UDP Discovery started on port: ${config.udpPort}`);
        });
        this.udpEndPoint.on('error', (err) => {
            console.error('UDP Discovery error:', err);
        });
    }
    send(data, options) {
        const defaultOptions = {
            timeout: 2000,
            nrOfRetries: 1,
            port: this.config.multicastPort,
            host: this.config.multicastHost,
        };
        const mergedOptions = { ...defaultOptions, ...options };
        const request = {
            requestId: (0, generateGuid_1.generateGuid)(),
            ...data,
        };
        const message = JSON.stringify(request);
        const buffer = Buffer.from(message);
        this.udpEndPoint.send(buffer, 0, buffer.length, this.config.multicastPort, this.config.multicastHost);
        return this.message$.pipe((0, operators_1.filter)((response) => response.data.requestId === request.requestId), (0, operators_1.take)(1), (0, operators_1.timeout)(mergedOptions.timeout), (0, operators_1.catchError)(() => {
            if (mergedOptions.nrOfRetries === undefined ||
                --mergedOptions.nrOfRetries > 0) {
                return this.send(data, mergedOptions);
            }
            return (0, rxjs_1.empty)();
        }));
    }
    discover(serviceName, options) {
        const defaultOptions = {
            timeout: 2000,
            nrOfRetries: undefined,
        };
        return this.send({
            serviceName,
            command: 'discovery',
        }, { ...defaultOptions, ...options });
    }
}
exports.UdpDiscovery = UdpDiscovery;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVURQRGlzY292ZXJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL0Nvbm5lY3RvcnMvVURQRGlzY292ZXJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxxREFBOEI7QUFDOUIsK0JBQW1EO0FBQ25ELDhDQUF1RTtBQUN2RSx3REFBb0Q7QUEyQnBELE1BQWEsWUFBWTtJQUNmLFdBQVcsQ0FBYztJQUMxQixJQUFJLENBQXlCO0lBQzdCLFFBQVEsQ0FBeUI7SUFDakMsTUFBTSxDQUF5QjtJQUM5QixNQUFNLENBQVc7SUFFekIsWUFBWSxNQUFpQjtRQUMzQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtRQUNwQixJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUE7UUFFN0MsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUU7WUFDbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNsQixDQUFDLENBQUMsQ0FBQTtRQUVGLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBQSxnQkFBUyxFQUE2QixJQUFJLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FDakYsSUFBQSxlQUFHLEVBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtZQUNWLElBQUksQ0FBQztnQkFDSCxNQUFNLFFBQVEsR0FBZ0I7b0JBQzVCLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQkFDbkMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ2QsT0FBTyxFQUFFLElBQUk7aUJBQ2QsQ0FBQTtnQkFDRCxPQUFPLFFBQVEsQ0FBQTtZQUNqQixDQUFDO1lBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQztnQkFDWixPQUFPO29C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