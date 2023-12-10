function parseLTCInt(arr) {
	return parseInt(arr.reverse().join(""), 2);
}

function parseLTCChunk(chunk) {
	const syncWord = chunk.splice(0, 16);

	const frame = chunk.splice(0, 16);
	const seconds = chunk.splice(0, 16);
	const minutes = chunk.splice(0, 16);
	const hours = chunk.splice(0, 16);

	const frameNumberUnits = parseLTCInt(frame.slice(0, 4));
	const frameNumberTens = parseLTCInt(frame.slice(8, 8 + 2));

	const secondsUnits = parseLTCInt(seconds.slice(0, 4));
	const secondsTens = parseLTCInt(seconds.slice(8, 8 + 3));

	const minutesUnits = parseLTCInt(minutes.slice(0, 4));
	const minutesTens = parseLTCInt(minutes.slice(8, 8 + 3));

	const hoursUnits = parseLTCInt(hours.slice(0, 4));
	const hoursTens = parseLTCInt(hours.slice(8, 8 + 2));

	const timecode = {
		hours: +(hoursTens + "" + hoursUnits),
		minutes: +(minutesTens + "" + minutesUnits),
		seconds: +(secondsTens + "" + secondsUnits),
		frame: +(frameNumberTens + "" + frameNumberUnits),
		dropFrame: frame.slice(10, 11)[0],
		colorFrame: frame.slice(11, 12)[0],
		clock: hours.slice(10, 11)[0],
		userBits1: frame.slice(4, 4 + 4),
		userBits2: frame.slice(12, 12 + 4),
		userBits3: seconds.slice(12, 12 + 4),
		userBits4: seconds.slice(12, 12 + 4),
		userBits5: minutes.slice(12, 12 + 4),
		userBits6: minutes.slice(12, 12 + 4),
		userBits7: hours.slice(12, 12 + 4),
		userBits8: hours.slice(12, 12 + 4),
	};

	return timecode;
}

const DEBUG = false;
let debugBuffer = [];

const buffer = [];

// prettier-ignore
const SYNC_WORD = [
	0, 0, 1, 1,
	1, 1, 1, 1,
	1, 1, 1, 1,
	1, 1, 0, 1
];

let sign = 0;
let transitions = 0;
let sampleCount = 0;

class AudioDBMeter extends AudioWorkletProcessor {
	process(inputs, outputs, parameters) {
		const samples = inputs[0][0];

		if (samples) {
			for (let i = 0; i < samples.length; i++) {
				if (DEBUG) debugBuffer.push(samples[i]);

				if (samples[i] === 0) continue;

				sampleCount++;

				const currSign = Math.sign(samples[i]);

				if (sign !== currSign) {
					transitions++;
					sign = currSign;

					const periodLength = (globalThis.sampleRate / 48000) * 16;
					if (sampleCount >= periodLength) {
						// eval transition count, should be either 1 or 2
						if (transitions === 1) {
							buffer.push(0);
						} else if (transitions === 2) {
							buffer.push(1);
						} else {
							// clear buffer on invalid input
							buffer.length = 0;
						}
						transitions = 0;
						sampleCount = 0;
					}
				}
			}
		}

		// find next sync word
		const bitString = buffer.join("");
		const syncIndex = bitString.indexOf(SYNC_WORD.join(""));
		if (syncIndex !== -1) {
			buffer.splice(0, syncIndex);

			// splice ltc buffer and parse
			if (buffer.length > 80 * 2) {
				const tc = parseLTCChunk(buffer.splice(0, 80));
				this.port.postMessage(tc);
			}
		}

		if (DEBUG) {
			while (debugBuffer.length > 128 * 3) {
				debugBuffer.shift();
			}
			this.port.postMessage(debugBuffer);
		}

		return true;
	}
}

registerProcessor("ltc", AudioDBMeter);
