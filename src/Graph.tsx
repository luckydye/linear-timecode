import { createEffect } from "solid-js";

function drawDebugBuffer(ctxt, data) {
	if (!ctxt) return;

	const canvas = ctxt.canvas;

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

export function Graph({ data }) {
	const canvas = document.createElement("canvas");
	canvas.width = 400;
	canvas.height = 40;
	canvas.style.width = "100%";
	canvas.style.imageRendering = "pixelated";
	const ctxt = canvas.getContext("2d");

	let pause = false;

	window.addEventListener("mousedown", () => {
		pause = true;
	});
	window.addEventListener("mouseup", () => {
		pause = false;
	});

	createEffect(() => {
		const d = data();
		if (!pause) drawDebugBuffer(ctxt, d);
	});

	return <div>{canvas}</div>;
}
