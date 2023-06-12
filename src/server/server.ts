import robot from "robotjs";
import express from "express";
import ws from "ws";

interface IRemoteControlServerOptions extends ws.ServerOptions {
	sPort: number;
	wsPort: number;
}

interface IRemoteControlServer {
	options: IRemoteControlServerOptions;
	socket(): void;
	server(): void;
	init(): void;
}

class RemoteControlServer implements IRemoteControlServer {
	options: IRemoteControlServerOptions;

	constructor() {
		this.options = {
			sPort: 3000,
			wsPort: 3001,
		};
	}

	handleCursorEvent(event: string, args: any[]) { 
				if (event === "mouse") {
					const [button, [x, y], smooth] = args;
					const currentMousePos = robot.getMousePos();

					const newX = currentMousePos.x + x;
					const newY = currentMousePos.y + y;
					console.log("newX", newX, "newY", newY, "currentMousePos", currentMousePos , "button", button);

					if (smooth) {
						robot.moveMouseSmooth(newX, newY, 5);
						return;
					}

					if (button === "none") {
						robot.moveMouse(newX, newY);
						return;
					}
					
					if (button === "left") {
						robot.mouseClick();
					} else if (button === "right") {
						robot.mouseClick("right");
					}
				} else if (event === "keyboard") {
					const [key] = args;

					robot.keyTap(key);
				}
	}

	socket() {
		const socket = new ws.Server({ port: this.options.wsPort }, () => {
			console.log(`Remote control socket listening on port ${this.options.wsPort}!`);
		});

		socket.on("connection", (ws) => {
			ws.on("message", (message) => {

				// Check if message is json parsable.
				if (RegExp(/^{.*}$/).test(message.toLocaleString())|| RegExp(/^\[.*\]$/).test(message.toLocaleString())) {
                    const data = JSON.parse(message.toLocaleString());
                    this.handleCursorEvent(data.event, data.args);

                } else {
                    console.log("Message from client ", message.toLocaleString());
                }
				
				/*
					DATA TEMPLATE:
					{
						event: "mouse",
						args: ["left", [x, y], false]
					}
				*/
			});

			ws.send("hello!");
		});
	}

	server() {
		const serverApp = express();

		serverApp.use((req, res, next) => {
			res.end();
		});

		serverApp.listen(this.options.sPort, () => {
			console.log(`Remote control server listening on port ${this.options.sPort}!`);
		});
	}

	init(options?: IRemoteControlServerOptions) {
		// Speed up the mouse.
		this.options = { ...this.options, ...options };
		this.server();
		this.socket();
	}
}

export default RemoteControlServer;
