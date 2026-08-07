import {mkdirSync, writeFileSync} from "node:fs";
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const sampleRate = 48000;
const seconds = 42;
const channels = 2;
const frames = sampleRate * seconds;
const data = Buffer.alloc(frames * channels * 2);

const clamp01 = (value) => Math.max(0, Math.min(1, value));
const smooth = (value) => {
  const v = clamp01(value);
  return v * v * (3 - 2 * v);
};
const envelope = (time, start, duration, attack = 0.08, release = 0.5) => {
  if (time < start || time > start + duration) return 0;
  const local = time - start;
  return Math.min(1, smooth(local / attack), smooth((duration - local) / release));
};
const tone = (frequency, time, phase = 0) => Math.sin(2 * Math.PI * frequency * time + phase);
const knock = (time, start, gain = 1) => {
  const local = time - start;
  if (local < 0 || local > 0.45) return 0;
  return tone(72 - local * 24, local) * Math.exp(-local * 11) * gain;
};
const key = (time, start, gain = 1) => {
  const local = time - start;
  if (local < 0 || local > 0.045) return 0;
  return tone(920 - local * 3800, local) * Math.exp(-local * 70) * gain;
};
const note = (time, start, frequency, duration, gain) =>
  tone(frequency, time, 0.15) * envelope(time, start, duration, 0.08, 1.2) * gain;

const sceneCuts = [3.5, 7, 13, 22, 28, 33, 37, 40];
const firstTyping = [0.42, 0.68, 0.91, 1.14, 1.37, 1.6, 1.83, 2.06, 2.29, 2.52];
const secondTyping = [3.84, 4.1, 4.36, 4.62, 4.88, 5.14, 5.4, 5.66];

for (let frame = 0; frame < frames; frame += 1) {
  const time = frame / sampleRate;
  const masterFade = Math.min(1, time / 1.2, (seconds - time) / 1.5);
  const room =
    tone(48, time) * 0.018 +
    tone(72, time, 0.7) * 0.009 +
    tone(96, time, 1.1) * 0.004;
  const movement =
    note(time, 3.5, 146.83, 3.5, 0.018) +
    note(time, 7, 164.81, 6.0, 0.017) +
    note(time, 13, 146.83, 9.0, 0.019) +
    note(time, 22, 174.61, 6.0, 0.018) +
    note(time, 28, 196, 5.0, 0.018) +
    note(time, 33, 220, 4.0, 0.02) +
    note(time, 37, 196, 3.0, 0.018);
  const cuts = sceneCuts.reduce((sum, start) => sum + knock(time, start, 0.075), 0);
  const typing = [...firstTyping, ...secondTyping].reduce((sum, start) => sum + key(time, start, 0.025), 0);
  const finalPair =
    note(time, 39.2, 220, 2.4, 0.025) +
    note(time, 39.55, 293.66, 2.1, 0.018);
  const mono = (room + movement + cuts + typing + finalPair) * Math.max(0, masterFade);
  const left = mono + tone(310, time) * 0.0015;
  const right = mono + tone(310, time, 0.42) * 0.0015;

  data.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(left * 32767))), frame * 4);
  data.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(right * 32767))), frame * 4 + 2);
}

const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + data.length, 4);
header.write("WAVE", 8);
header.write("fmt ", 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(channels, 22);
header.writeUInt32LE(sampleRate, 24);
header.writeUInt32LE(sampleRate * channels * 2, 28);
header.writeUInt16LE(channels * 2, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(data.length, 40);

const here = dirname(fileURLToPath(import.meta.url));
const output = resolve(here, "../public/audio/lenso-intro.wav");
mkdirSync(dirname(output), {recursive: true});
writeFileSync(output, Buffer.concat([header, data]));
console.log(`generated ${output}`);
