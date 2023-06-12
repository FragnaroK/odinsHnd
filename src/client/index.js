const mousepad = document.getElementById("mousepad");
const printPosition = document.getElementById("position");
const connectionStatus = document.getElementById("connection");
const connectionButton = document.getElementById("connection-button");
const mousepadAnalog = document.getElementById("analog");

const mousePositionIncrease = {
	x: 0,
	y: 0,
};

const mousePosition = {
	x: 0,
	y: 0,
};

var socket = false;
var clicking = false;

function initSocket(connect = true) {
	if (connect) {
		socket = new WebSocket("ws://192.168.0.176:3001");

		connectionButton.innerHTML = "Connecting...";
		// Websocket connection to send position to server

		socket.addEventListener("open", function (event) {
			socket.send("Hello Server!");
			connectionStatus.innerHTML = "Connected";
			connectionButton.innerHTML = "Disconnect";
		});

		socket.addEventListener("close", function (event) {
			connectionStatus.innerHTML = "Disconnected";
			connectionButton.innerHTML = "Connect";
		});

		socket.addEventListener("message", function (event) {
			console.log("Message from server ", event.data);
		});
	} else {
		connectionStatus.innerHTML = "Disconnected";
		connectionButton.innerHTML = "Connect";
		socket && socket.close();
	}
}

function getMousePosition(e, smooth = false) {
	const x = e.clientX || e.touches[0].clientX;
	const y = e.clientY || e.touches[0].clientY;
	const mousepadWidth = mousepad.offsetWidth;
	const mousepadHeight = mousepad.offsetHeight;
	const mousepadCenterX = mousepadWidth / 2;
	const mousepadCenterY = mousepadHeight / 2;
	const mousepadX = mousepad.getBoundingClientRect().left;
	const mousepadY = mousepad.getBoundingClientRect().top;

	mousePosition.x = x - mousepadX;
	mousePosition.y = y - mousepadY;

	mousePositionIncrease.x = ((mousePosition.x - mousepadCenterX) / mousepadCenterX) * 50;
	mousePositionIncrease.y = ((mousePosition.y - mousepadCenterY) / mousepadCenterY) * 50;

	if (
		mousePositionIncrease.x < 50 &&
		mousePositionIncrease.x > -50 &&
		mousePositionIncrease.y < 50 &&
		mousePositionIncrease.y > -50
	) {
		mousepadAnalog.style.transform = `translate3d(${mousePositionIncrease.x}px, ${mousePositionIncrease.y}px, 0)`;

		console.log(`X: ${mousePositionIncrease.x}`, `\nY: ${mousePositionIncrease.y}`);

		printPosition.innerHTML = `
        X: ${mousePositionIncrease.x} <br/>
        Y: ${mousePositionIncrease.y}`;

		socket &&
			socket.send(
				JSON.stringify({
					event: "mouse",
					args: ["none", [Math.floor(mousePositionIncrease.x), Math.floor(mousePositionIncrease.y)], smooth],
				})
			);
	}
 
}

function main() {
	connectionButton.innerHTML = "Connect";

	// LISTENERS
	connectionButton.addEventListener("click", () => {
		if (connectionButton.innerHTML === "Connect") {
			initSocket();
		} else {
			initSocket(false);
		}
	});

	mousepad.addEventListener("mousedown", (e) => {
		console.log("mouse down");
		if (!clicking) mousepad.addEventListener("mousemove", getMousePosition);
	});

	mousepad.addEventListener("mouseup", (e) => {
		console.log("mouse up");
		mousepad.removeEventListener("mousemove", getMousePosition);
		mousepadAnalog.style.transform = `translate3d(0px, 0px, 0)`;
	});

	mousepad.addEventListener("touchstart", (e) => {
		console.log("touch start");
		if (!clicking) mousepad.addEventListener("touchmove", getMousePosition);
	});

	mousepad.addEventListener("touchend", (e) => {
		console.log("touch end");
		mousepad.removeEventListener("touchmove", getMousePosition);
		mousepadAnalog.style.transform = `translate3d(0px, 0px, 0)`;
	});

	mousepad.addEventListener("click", (e) => { 
		getMousePosition(e);
	});

	// on tap send left click
	mousepadAnalog.addEventListener("click", (e) => {
		socket &&
			socket.send(
				JSON.stringify({
					event: "mouse",
					args: ["left", [Math.floor(mousePositionIncrease.x), Math.floor(mousePositionIncrease.y)]],
				})
			);
		clicking = false;
	});

	// on double tap send right click
	mousepadAnalog.addEventListener("dblclick", (e) => {
		socket &&
			socket.send(
				JSON.stringify({
					event: "mouse",
					args: ["right", [Math.floor(mousePositionIncrease.x), Math.floor(mousePositionIncrease.y)]],
				})
			);
	});

	// on long press send middle click
	mousepadAnalog.addEventListener("contextmenu", (e) => {
		e.preventDefault();
		socket &&
			socket.send(
				JSON.stringify({
					event: "mouse",
					args: ["middle", [Math.floor(mousePositionIncrease.x), Math.floor(mousePositionIncrease.y)]],
				})
			);
	});

	// Prevent page refresh on slide down
	window.addEventListener("touchmove", function (event) {
		event.preventDefault();
	});
}

window.onload = main;

