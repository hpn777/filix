"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocket = void 0;
const tslib_1 = require("tslib");
const ws_1 = tslib_1.__importDefault(require("ws"));
const underscore_1 = tslib_1.__importDefault(require("underscore"));
class WebSocket {
    debug = false;
    reconnectInterval = 2000;
    timeoutInterval = 2000;
    url;
    protocols = ['json'];
    onopen = (event) => { };
    onclose = (event) => { };
    onmessage = (event) => { };
    onerror = (event) => { };
    ws;
    forcedClose = false;
    timedOut = false;
    constructor(options) {
        underscore_1.default.extend(this, options);
        this.connect(false);
    }
    connect(reconnectAttempt) {
        this.ws = new ws_1.default(this.url);
        const timeout = setInterval(() => {
            this.timedOut = true;
            this.ws?.close();
            this.timedOut = false;
        }, this.timeoutInterval);
        this.ws.on('open', event => {
            clearTimeout(timeout);
            reconnectAttempt = false;
            this.onopen(event);
        });
        this.ws.on('close', event => {
            this.ws = undefined;
            this.onclose(event);
            setTimeout(() => {
                if (!this.forcedClose)
                    this.connect(true);
            }, this.reconnectInterval);
        });
        this.ws.on('message', event => {
            this.onmessage(event);
        });
        this.ws.on('error', (event) => {
            if (event.code == 'ETIMEDOUT' ||
                event.code == 'ENOTFOUND' ||
                event.code == 'ECONNREFUSED') {
                clearTimeout(timeout);
                setTimeout(() => {
                    this.connect(true);
                }, this.reconnectInterval);
            }
            this.onerror(event);
        });
    }
    send(data) {
        if (this.ws) {
            return this.ws.send(data);
        }
        else {
            throw 'INVALID_STATE_ERR : Pausing to reconnect websocket';
        }
    }
    close() {
        if (this.ws) {
            this.forcedClose = true;
            this.ws.close();
        }
    }
    refresh() {
        if (this.ws) {
            this.ws.close();
        }
    }
}
exports.WebSocket = WebSocket;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2ViU29ja2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL0Nvbm5lY3RvcnMvV2ViU29ja2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxvREFBbUI7QUFDbkIsb0VBQTBCO0FBYzFCLE1BQWEsU0FBUztJQUNwQixLQUFLLEdBQUcsS0FBSyxDQUFBO0lBQ2IsaUJBQWlCLEdBQUcsSUFBSSxDQUFBO0lBQ3hCLGVBQWUsR0FBRyxJQUFJLENBQUE7SUFDdEIsR0FBRyxDQUFTO0lBQ1osU0FBUyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDcEIsTUFBTSxHQUFHLENBQUMsS0FBVSxFQUFRLEVBQUUsR0FBRSxDQUFDLENBQUE7SUFDakMsT0FBTyxHQUFHLENBQUMsS0FBVSxFQUFRLEVBQUUsR0FBRSxDQUFDLENBQUE7SUFDbEMsU0FBUyxHQUFHLENBQUMsS0FBVSxFQUFRLEVBQUUsR0FBRSxDQUFDLENBQUE7SUFDcEMsT0FBTyxHQUFHLENBQUMsS0FBVSxFQUFRLEVBQUUsR0FBRSxDQUFDLENBQUE7SUFFMUIsRUFBRSxDQUFLO0lBQ1AsV0FBVyxHQUFHLEtBQUssQ0FBQTtJQUNuQixRQUFRLEdBQUcsS0FBSyxDQUFBO0lBRXhCLFlBQVksT0FBeUI7UUFDbkMsb0JBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFBO1FBQ3ZCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDckIsQ0FBQztJQUVPLE9BQU8sQ0FBQyxnQkFBeUI7UUFDdkMsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLFlBQUUsQ0FBQyxJQUFJLENBQUMsR0FBSSxDQUFDLENBQUE7UUFFM0IsTUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRTtZQUMvQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtZQUNwQixJQUFJLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFBO1lBQ2hC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