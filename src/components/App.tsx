import ltcWorklet from "../ltc?url";
import { createSignal } from "solid-js";
import { render } from "solid-js/web";

import { TimeCode } from "./TimeCode.jsx";
import { Graph } from "./Graph.jsx";

const audioCtx = new AudioContext();
window.addEventListener("mousedown", () => {
	audioCtx.resume();
});

let [graphData, setGraphData] = createSignal([]);

function App({ stream }) {
	const [tc, setTc] = createSignal();

	const source = audioCtx.createMediaStreamSource(stream);

	const gain = audioCtx.createGain();
	source.connect(gain);

	const processor = new AudioWorkletNode(audioCtx, "ltc");
	gain.connect(processor);

	processor.port.onmessage = ({ data }) => {
		if (Array.isArray(data)) {
			setGraphData(data);
		} else {
			setTc(data);
		}
	};

	return (
		<div>
			<Graph data={graphData} />
			<TimeCode timecode={tc} />
		</div>
	);
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

async function main() {
	await audioCtx.audioWorklet.addModule(ltcWorklet);
	const stream = await getMedia();

	render(() => <App stream={stream} />, document.getElementsByTagName("main")[0]);
}

main();
