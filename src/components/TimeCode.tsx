import { createEffect, createSignal } from "solid-js";

function timeCodeToString(tc) {
	if (tc && tc.hours)
		return `${tc.hours.toString().padStart(2, "0")}:${tc.minutes
			.toString()
			.padStart(2, "0")}:${tc.seconds.toString().padStart(2, "0")}:${tc.frame
			.toString()
			.padStart(2, "0")}`;

	return "00:00:00:00";
}

export function TimeCode({ timecode }) {
	const [fps, setFps] = createSignal(0);

	let lastFrame = Date.now();
	const frames: number[] = [];

	createEffect(() => {
		timecode();

		const currFrame = Date.now();

		const delta = currFrame - lastFrame;
		lastFrame = currFrame;

		frames.push(1000 / delta);
		if (frames.length > 12) frames.shift();

		setFps(frames.reduce((prev, curr) => prev + curr / frames.length, 0));
	});

	const timeString = () => timeCodeToString(timecode());
	return (
		<div class="p-4">
			<pre>{`${timeString()} - ${Math.floor(fps())}fps`}</pre>
		</div>
	);
}
