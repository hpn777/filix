"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tailLogConnector = void 0;
const tslib_1 = require("tslib");
const Rx = tslib_1.__importStar(require("rx"));
const tail_1 = require("tail");
const tailLogConnector = (config) => {
    let row_id = 1;
    let repetitionBuffer;
    let repetitionBufferCount = 0;
    const suppress = config.suppress || ['tcpflow', 'survtimeline3', 'tpmonitor'];
    const parseLog = (txt) => {
        const m = txt.split(/^((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Sept|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?))\ *((?:(?:[0-2]?\d{1})|(?:[3][01]{1})))(?![\d])\ ((?:(?:[0-1][0-9])|(?:[2][3])|(?:[0-9])):(?:[0-5][0-9])(?::[0-5][0-9])?(?:\s?(?:am|AM|pm|PM))?)\ (\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|[a-z0-9]*)\ ([a-z0-9_]*)(?:-slice(\d+))?(?:\[(.*?)\])?\:\ (\d+\ )?(?:(I|W|E|D)?\d{0,2}\ )(.*)/g);
        if (m.length !== 1) {
            const tempTime = new Date();
            const timestamp = (new Date(`${m[1]} ${m[2]} ${tempTime.getFullYear()} ${m[3]}`).getTime() *
                1000 +
                Number(m[8])) *
                1000;
            if (suppress.indexOf(m[5]) !== -1) {
                const srcFileName = m[10].split(' ')[0];
                if (repetitionBuffer === srcFileName) {
                    --row_id;
                    repetitionBufferCount++;
                }
                else {
                    repetitionBuffer = srcFileName;
                    repetitionBufferCount = 1;
                }
            }
            else {
                repetitionBufferCount = 1;
            }
            const data = {
                id: row_id,
                timestamp,
                host: m[4],
                appName: m[5],
                slice: m[6],
                pId: m[7],
                type: m[9],
                msg: m[10],
                count: repetitionBufferCount,
            };
            row_id++;
            return data;
        }
        if (txt) {
            return {
                id: row_id++,
                timestamp: new Date().getTime() * 1000000,
                msg: txt,
                count: 1,
            };
        }
        return {};
    };
    config.encoding = config.encoding || 'ascii';
    const outputPath = config.path;
    const tail = new tail_1.Tail(outputPath, undefined, { encoding: config.encoding, follow: true }, true);
    const tailStream = Rx.Observable.fromEvent(tail, 'line').map(parseLog);
    tailStream.watch = () => {
        tail.watch();
    };
    tailStream.unwatch = () => {
        tail.unwatch();
    };
    return tailStream;
};
exports.tailLogConnector = tailLogConnector;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFpbExvZ0Nvbm5lY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db25uZWN0b3JzL1RhaWxMb2dDb25uZWN0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLCtDQUF3QjtBQUN4QiwrQkFBMkI7QUFxQnBCLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxNQUFxQixFQUFPLEVBQUU7SUFDN0QsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFBO0lBQ2QsSUFBSSxnQkFBb0MsQ0FBQTtJQUN4QyxJQUFJLHFCQUFxQixHQUFHLENBQUMsQ0FBQTtJQUU3QixNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxJQUFJLENBQUMsU0FBUyxFQUFFLGVBQWUsRUFBRSxXQUFXLENBQUMsQ0FBQTtJQUU3RSxNQUFNLFFBQVEsR0FBRyxDQUFDLEdBQVcsRUFBaUIsRUFBRTtRQUM5QyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUNqQiw4YUFBOGEsQ0FDL2EsQ0FBQTtRQUVELElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUNuQixNQUFNLFFBQVEsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFBO1lBQzNCLE1BQU0sU0FBUyxHQUNiLENBQUMsSUFBSSxJQUFJLENBQ1AsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FDcEQsQ0FBQyxPQUFPLEVBQUU7Z0JBQ1QsSUFBSTtnQkFDSixNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2YsSUFBSSxDQUFBO1lBRU4sSUFBSSxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQ2xDLE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7Z0JBQ3ZDLElBQUksZ0JBQWdCLEtBQUssV0FBVyxFQUFFLENBQUM7b0JBQ3JDLEVBQUUsTUFBTSxDQUFBO29CQUNSLHFCQUFxQixFQUFFLENBQUE7Z0JBQ3pCLENBQUM7cUJBQU0sQ0FBQztvQkFDTixnQkFBZ0IsR0FBRyxXQUFXLENBQUE7b0JBQzlCLHFCQUFxQixHQUFHLENBQUMsQ0FBQTtnQkFDM0IsQ0FBQztZQUNILENBQUM7aUJBQU0sQ0FBQztnQkFDTixxQkFBcUIsR0FBRyxDQUFDLENBQUE7WUFDM0IsQ0FBQztZQUVELE1BQU0sSUFBSSxHQUFhO2dCQUNyQixFQUFFLEVBQUUsTUFBTTtnQkFDVixTQUFTO2dCQUNULElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNWLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNiLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNYLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNULElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNWLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUNWLEtBQUssRUFBRSxxQkFBcUI7YUFDN0IsQ0FBQTtZQUVELE1BQU0sRUFBRSxDQUFBO1lBRVIsT0FBTyxJQUFJLENBQUE7UUFDYixDQUFDO1FBRUQsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNSLE9BQU87Z0JBQ0wsRUFBRSxFQUFFLE1BQU0sRUFBRTtnQkFDWixTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxPQUFPO2dCQUN6QyxHQUFHLEVBQUUsR0FBRztnQkFDUixLQUFLLEVBQUUsQ0FBQzthQUNULENBQUE7UUFDSCxDQUFDO1FBRUQsT0FBTyxFQUFFLENBQUE7SUFDWCxDQUFDLENBQUE7SUFFRCxNQUFNLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLElBQUksT0FBTyxDQUFBO0lBQzVDLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUE7SUFFOUIsTUFBTSxJQUFJLEdBQUcsSUFBSSxXQUFJLENBQ25CLFVBQVUsRUFDVixTQUFTLEVBQ1QsRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQzNDLElBQUksQ0FDTCxDQUFBO0lBRUQsTUFBTSxVQUFVLEdBQVEsRUFBRSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUUzRSxVQUFVLENBQUMsS0FBSyxHQUFHLEdBQUcsRUFBRTtRQUN0QixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUE7SUFDZCxDQUFDLENBQUE7SUFFRCxVQUFVLENBQUMsT0FBTyxHQUFHLEdBQUcsRUFBRTtRQUN4QixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDaEIsQ0FBQyxDQUFBO0lBRUQsT0FBTyxVQUFVLENBQUE7QUFDbkIsQ0FBQyxDQUFBO0FBckZZLFFBQUEsZ0JBQWdCLG9CQXFGNUIifQ==