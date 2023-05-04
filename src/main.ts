import ltcWorklet from "./ltc.js?url";

const audioCtx = new AudioContext();

let pause = false;

window.addEventListener("mousedown", () => {
	pause = true;
	audioCtx.resume();
});
window.addEventListener("mouseup", () => {
	pause = false;
});

function timeCodeToString(tc) {
	return `${tc.hours.toString().padStart(2, "0")}:${tc.minutes
		.toString()
		.padStart(2, "0")}:${tc.seconds.toString().padStart(2, "0")}:${tc.frame
		.toString()
		.padStart(2, "0")}`;
}

async function getMedia() {
	let stream: MediaStream | undefined;

	try {
		stream = await navigator.mediaDevices.getUserMedia({
			audio: {
				autoGainControl: false,
				echoCancellation: false,
				noiseSuppression: false,
			},
		});
	} catch (err) {
		console.error(err);
	}

	return stream;
}

const display = document.createElement("pre");
document.body.append(display);

const canvas = document.createElement("canvas");
canvas.width = 400;
canvas.height = 100;
canvas.style.width = "100%";
canvas.style.imageRendering = "pixelated";
const ctxt = canvas.getContext("2d");
document.body.append(canvas);

function drawDebugBuffer(data) {
	if (!ctxt || pause) return;

	ctxt.fillStyle = "black";
	ctxt.fillRect(0, 0, canvas.width, canvas.height);

	ctxt.beginPath();
	ctxt.strokeStyle = "green";
	for (let i = 0; i < data.length; i++) {
		const v = data[i] * 20;
		ctxt.lineTo(i, canvas.height / 2 + v);
	}
	ctxt.stroke();
}

async function main() {
	await audioCtx.audioWorklet.addModule(ltcWorklet);

	const stream = await getMedia();

	if (!stream) return;

	const source = audioCtx.createMediaStreamSource(stream);

	const gain = audioCtx.createGain();
	source.connect(gain);

	const processor = new AudioWorkletNode(audioCtx, "ltc");
	gain.connect(processor);

	let lastFrame = Date.now();
	const frames: number[] = [];

	processor.port.onmessage = ({ data }) => {
		if (Array.isArray(data)) {
			drawDebugBuffer(data);
		} else {
			const currFrame = Date.now();

			const delta = currFrame - lastFrame;
			lastFrame = currFrame;

			frames.push(1000 / delta);
			if (frames.length > 12) frames.shift();

			display.innerHTML = `${timeCodeToString(data)} -- ${Math.floor(
				frames.reduce((prev, curr) => prev + curr / frames.length, 0)
			)}fps \n${new Date().toTimeString()}`;
		}
	};
}

main();
