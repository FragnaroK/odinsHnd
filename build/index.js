"use strict";
// THIS ROOT INDEX FILE JUST RUNS BOTH CLIENT AND SERVER FOR DEVELOPMENT PURPOSES
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./server/server"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({
    path: '.env'
});
function main() {
    const server = new server_1.default();
    server.init({
        sPort: process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT) : 3000,
        wsPort: process.env.WS_PORT ? parseInt(process.env.WS_PORT) : 3001,
    });
}
// Run the main function.
main();
