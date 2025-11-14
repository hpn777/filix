"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.udpDiscovery = exports.commandPortConnector = exports.tailLogConnector = void 0;
const tslib_1 = require("tslib");
const TailLogConnector_1 = require("./TailLogConnector");
Object.defineProperty(exports, "tailLogConnector", { enumerable: true, get: function () { return TailLogConnector_1.tailLogConnector; } });
const UDPDiscovery_1 = require("./UDPDiscovery");
const CommandPortConnector_1 = tslib_1.__importDefault(require("./CommandPortConnector"));
exports.commandPortConnector = CommandPortConnector_1.default;
const udpDiscovery = (config) => new UDPDiscovery_1.UdpDiscovery(config);
exports.udpDiscovery = udpDiscovery;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvQ29ubmVjdG9ycy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEseURBQXFEO0FBT25ELGlHQVBPLG1DQUFnQixPQU9QO0FBTmxCLGlEQUE2QztBQUM3QywwRkFBeUQ7QUFNL0IsK0JBTm5CLDhCQUFvQixDQU1tQjtBQUo5QyxNQUFNLFlBQVksR0FBRyxDQUFDLE1BQVcsRUFBRSxFQUFFLENBQUMsSUFBSSwyQkFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBSzVELG9DQUFZIn0=