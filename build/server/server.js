"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const robotjs_1 = __importDefault(require("robotjs"));
const express_1 = __importDefault(require("express"));
const ws_1 = __importDefault(require("ws"));
class RemoteControlServer {
    constructor() {
        this.options = {
            sPort: 3000,
            wsPort: 3001,
        };
    }
    handleCursorEvent(event, args) {
        if (event === "mouse") {
            const [button, [x, y], smooth] = args;
            const currentMousePos = robotjs_1.default.getMousePos();
            const newX = currentMousePos.x + x;
            const newY = currentMousePos.y + y;
            console.log("newX", newX, "newY", newY, "currentMousePos", currentMousePos, "button", button);
            if (smooth) {
                robotjs_1.default.moveMouseSmooth(newX, newY, 5);
                return;
            }
            if (button === "none") {
                robotjs_1.default.moveMouse(newX, newY);
                return;
            }
            if (button === "left") {
                robotjs_1.default.mouseClick();
            }
            else if (button === "right") {
                robotjs_1.default.mouseClick("right");
            }
        }
        else if (event === "keyboard") {
            const [key] = args;
            robotjs_1.default.keyTap(key);
        }
    }
    socket() {
        const socket = new ws_1.default.Server({ port: this.options.wsPort }, () => {
            console.log(`Remote control socket listening on port ${this.options.wsPort}!`);
        });
        socket.on("connection", (ws) => {
            ws.on("message", (message) => {
                // Check if message is json parsable.
                if (RegExp(/^{.*}$/).test(message.toLocaleString()) || RegExp(/^\[.*\]$/).test(message.toLocaleString())) {
                    const data = JSON.parse(message.toLocaleString());
                    this.handleCursorEvent(data.event, data.args);
                }
                else {
                    console.log("Message from client ", message.toLocaleString());
                }
                /*
                    DATA TEMPLATE:
                    {
                        event: "mouse",
                        args: ["left", [x, y]]
                    }
                */
            });
            ws.send("hello!");
        });
    }
    server() {
        const serverApp = (0, express_1.default)();
        serverApp.use((req, res, next) => {
            res.end();
        });
        serverApp.listen(this.options.sPort, () => {
            console.log(`Remote control server listening on port ${this.options.sPort}!`);
        });
    }
    init(options) {
        // Speed up the mouse.
        this.options = Object.assign(Object.assign({}, this.options), options);
        this.server();
        this.socket();
    }
}
exports.default = RemoteControlServer;
