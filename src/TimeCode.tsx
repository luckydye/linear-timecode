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

export function TimeCode(props: { timecode }) {
  const [fps, setFps] = createSignal(0);
  const [trigger, setTrigger] = createSignal(0);

	const bpm = 93;
  const beatOffset = 0.2;

  let lastFrame = Date.now();
  const frames: number[] = [];

  const timeString = () => {
    const currFrame = Date.now();

    const delta = currFrame - lastFrame;
    lastFrame = currFrame;

    frames.push(1000 / delta);
    if (frames.length > 12) frames.shift();

    setFps(frames.reduce((prev, curr) => prev + curr / frames.length, 0));

    const tc = props.timecode;
    if (tc) {
      const frame = tc.frame + tc.seconds * fps() + tc.minutes * 60 * fps();
			const bps = bpm / 60;

			let beat = Math.floor((frame / (fps() / bps) + beatOffset));
      setTrigger(beat % 2);
    }

    return timeCodeToString(props.timecode);
  };

  return (
    <div class="p-4">
      <pre>
        <div class={[
          'inline-block w-3 h-3 bg-green-500 rounded-full',
          trigger() === 1 ? 'opacity-0' : 'opacity-100'
        ].join(" ")}/>
        <div class={[
          'inline-block w-3 h-3 bg-red-500 rounded-full',
          trigger() === 0 ? 'opacity-0' : 'opacity-100'
        ].join(" ")}/>
        <span class="ml-4">{`${timeString()} - ${Math.floor(fps())}fps`}</span>
      </pre>
    </div>
  );
}
