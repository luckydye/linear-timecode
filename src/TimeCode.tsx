import { createSignal } from "solid-js";
import { SwissGL } from "../lib/gl.js";

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
  const [trigger, setTrigger] = createSignal(0);
  const [frame, setFrame] = createSignal(0);

  const [bpm, setBpm] = createSignal(120);

  const beatOffset = 0.2;

  let lastFrame = Date.now();
  let fps = 0;
  const frames: number[] = [];

  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 1280;
  canvas.style.width = "100%";

  const gl = SwissGL(canvas);

  const timeString = () => {
    const currFrame = Date.now();

    const delta = currFrame - lastFrame;
    lastFrame = currFrame;

    frames.push(1000 / delta);
    if (frames.length > 12) frames.shift();

    fps = frames.reduce((prev, curr) => prev + curr / frames.length, 0);

    const tc = props.timecode;
    if (tc) {
      const f = (tc.minutes * 60 + tc.seconds) * 30 + tc.frame;

      setFrame(f);

      const bps = bpm() / 60;

      let beat = Math.floor(f / (30 / bps) + beatOffset);

      setTrigger(beat % 2);

      gl(
        {
          t: f / 10,
          filter: "nearest",
          Mesh: [50, 50],
          seed: beat % 2,
          VP: `XY*0.2+sin(t+XY.yx*2.0)*0.2,0,1`,
          FP: `
            void fragment() {

              FOut = vec4(UV,seed,1);
            }
          `,
        },
        undefined
      );
    }

    return timeCodeToString(props.timecode);
  };

  return (
    <div>
      <div class="flex justify-between">
        <pre class="py-2 px-4">
          <div
            class={[
              "inline-block w-3 h-3 bg-green-500 rounded-full",
              trigger() === 1 ? "opacity-0" : "opacity-100",
            ].join(" ")}
          />
          <div
            class={[
              "inline-block w-3 h-3 bg-red-500 rounded-full",
              trigger() === 0 ? "opacity-0" : "opacity-100",
            ].join(" ")}
          />
          <span class="ml-4">{`${timeString()} f${frame()} - ${Math.floor(fps)}fps`}</span>
        </pre>

        <div class="flex items-center">
          bpm
          <input
            class="px-2 bg-transparent"
            value={bpm()}
            onChange={(e) => {
              const v = +e.currentTarget.value;
              console.log(v);

              setBpm(v);
            }}
          ></input>
        </div>
      </div>

      {canvas}
    </div>
  );
}
