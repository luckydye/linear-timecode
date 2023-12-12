import RiveCanvas, { File } from "@rive-app/canvas-advanced";
import riveWasm from "@rive-app/canvas-advanced/rive.wasm?url";
import { createEffect } from "solid-js";
import { render } from "solid-js/web";

async function load() {
  const rive = await RiveCanvas({
    locateFile: (_) => riveWasm,
  });

  return rive;
}


export function Rive(props: { src: string; time: number }) {
  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 1280;
  canvas.style.width = `${canvas.width / devicePixelRatio}px`;
  canvas.style.height = `auto`;

  load().then(async (rive) => {
    console.log("create rive render");

    const renderer = rive.makeRenderer(canvas);

    const bytes = await (await fetch(new Request(props.src))).arrayBuffer();

    // import File as a named import from the Rive dependency
    const file = (await rive.load(new Uint8Array(bytes))) as File;

    const artboard = file.artboardByName("loader");

    if (!artboard) throw new Error("Artboard not found");

    const stateMachine = new rive.StateMachineInstance(
      artboard.stateMachineByName("State Machine 1"),
      artboard
    );

    if (!stateMachine) throw new Error("State machine not found");

    let lastTime = 0;

    function renderLoop(time: number) {

      if (!lastTime) {
        lastTime = time;
      }
      const elapsedTime = time - lastTime;

      lastTime = time;

      renderer.clear();
      stateMachine.advance(elapsedTime);
      artboard.advance(elapsedTime);
      renderer.save();
      renderer.align(
        rive.Fit.contain,
        rive.Alignment.center,
        {
          minX: 0,
          minY: 0,
          maxX: canvas.width,
          maxY: canvas.height,
        },
        artboard.bounds
      );
      artboard.draw(renderer);
      renderer.restore();
    }

    createEffect(() => {
      const time = props.time;
      rive.requestAnimationFrame(() => renderLoop(time));
    });
  });

  return canvas;
}
