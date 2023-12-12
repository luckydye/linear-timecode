import ltcWorklet from "./ltc?url";
import { createSignal } from "solid-js";
import { render } from "solid-js/web";

import { TimeCode } from "./TimeCode.jsx";
import { Graph } from "./Graph.jsx";
import { Rive } from "./Rive.js";
import { Timecode } from "./ltc.js";

const audioCtx = new AudioContext();
window.addEventListener("click", () => {
  audioCtx.resume();
});

// let [graphData, setGraphData] = createSignal([]);

function App(props: { stream }) {
  const [tc, setTc] = createSignal<Timecode>();

  const processor = new AudioWorkletNode(audioCtx, "ltc");

  processor.port.onmessage = ({ data }) => {
    if (Array.isArray(data)) {
      // setGraphData(data);
    } else {
      setTc(data);
    }
  };

  window.onclick = () => {
    const source = audioCtx.createMediaStreamSource(props.stream);
    const gain = audioCtx.createGain();
    source.connect(gain);
    gain.connect(processor);
  };

  let time = () => {
    const t = tc();
    if (!t) return 0;

    const f = t.minutes * 60 + t.seconds + (t.frame / 30);
    return f;
  };

  return (
    <div>
      {/* <Graph data={graphData} /> */}
      <TimeCode timecode={tc()} />
      <Rive src="/visio-loader.riv" time={time()} />
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

  console.log("render app");

  render(() => <App stream={stream} />, document.getElementsByTagName("main")[0]);
}

main();
