export interface S950Params {
  /** 1–999, default 200. >100 lengthens, <100 shortens. */
  stretchPercent: number;
  /** Grain length in ms, 1–2000, default 1000. Ignored when autoD is true. */
  dTime: number;
  /** When true, dTime is derived automatically from the input length and ratio. */
  autoD: boolean;
  mode: 'mono' | 'poly';
  /** Pitch shift in semitones, -36 to +36, applied independently of the time stretch. */
  transpose: number;
}

const CROSSFADE_RATIO = 0.1;

function computeAutoDTime(input: AudioBuffer, stretchPercent: number): number {
  const ratio = stretchPercent / 100;
  const durationMs = (input.length / input.sampleRate) * 1000;
  // Aim for roughly 40 cycles across the sample, biased shorter as the ratio grows
  // further from 1 — this keeps repeat/skip artefacts from dominating short samples.
  const targetCycles = 40 / Math.max(ratio, 1 / ratio);
  const dTime = durationMs / Math.max(targetCycles, 1);
  return Math.min(2000, Math.max(1, Math.round(dTime)));
}

function grainStartForPoly(grainIndex: number, grainSamples: number, inputLength: number): number {
  const start = grainIndex * grainSamples;
  return Math.min(start, Math.max(0, inputLength - grainSamples));
}

function buildCyclePlan(inputCycles: number, stretchPercent: number): number[] {
  const ratio = stretchPercent / 100;
  const outputCycles = Math.max(1, ratio >= 1 ? Math.ceil(inputCycles * ratio) : Math.floor(inputCycles * ratio));
  const plan: number[] = [];

  for (let i = 0; i < outputCycles; i++) {
    plan.push(Math.min(inputCycles - 1, Math.floor(i / ratio)));
  }

  return plan;
}

function transposeRate(semitones: number): number {
  return Math.pow(2, semitones / 12);
}

export function s950Stretch(input: AudioBuffer, params: S950Params): AudioBuffer {
  const { stretchPercent, autoD, mode, transpose } = params;
  const dTimeMs = autoD ? computeAutoDTime(input, stretchPercent) : params.dTime;

  const grainSamples = Math.max(1, Math.round((dTimeMs * input.sampleRate) / 1000));
  const inputCycles = Math.max(1, Math.ceil(input.length / grainSamples));
  const plan = buildCyclePlan(inputCycles, stretchPercent);

  const fadeSamples = Math.max(1, Math.round(grainSamples * CROSSFADE_RATIO));
  const outputLength = plan.length * grainSamples;

  const ctx = new OfflineAudioContext(input.numberOfChannels, outputLength, input.sampleRate);
  const stretched = ctx.createBuffer(input.numberOfChannels, outputLength, input.sampleRate);

  for (let channel = 0; channel < input.numberOfChannels; channel++) {
    const src = input.getChannelData(channel);
    const dst = stretched.getChannelData(channel);

    plan.forEach((cycleIndex, outIndex) => {
      const srcStart =
        mode === 'poly'
          ? grainStartForPoly(cycleIndex, grainSamples, input.length)
          : Math.min(cycleIndex * grainSamples, Math.max(0, input.length - grainSamples));
      const dstStart = outIndex * grainSamples;

      for (let i = 0; i < grainSamples; i++) {
        const srcSample = src[srcStart + i] ?? 0;
        let gain = 1;
        if (i < fadeSamples) {
          gain = i / fadeSamples;
        } else if (i >= grainSamples - fadeSamples) {
          gain = (grainSamples - i) / fadeSamples;
        }
        dst[dstStart + i] += srcSample * gain;
      }
    });
  }

  if (transpose === 0) {
    return stretched;
  }

  return resampleBuffer(stretched, transposeRate(transpose));
}

function resampleBuffer(buffer: AudioBuffer, rate: number): AudioBuffer {
  const outLength = Math.max(1, Math.round(buffer.length / rate));
  const ctx = new OfflineAudioContext(buffer.numberOfChannels, outLength, buffer.sampleRate);
  const result = ctx.createBuffer(buffer.numberOfChannels, outLength, buffer.sampleRate);

  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const src = buffer.getChannelData(channel);
    const dst = result.getChannelData(channel);
    for (let i = 0; i < outLength; i++) {
      const srcPos = i * rate;
      const i0 = Math.floor(srcPos);
      const i1 = Math.min(buffer.length - 1, i0 + 1);
      const frac = srcPos - i0;
      dst[i] = (src[i0] ?? 0) * (1 - frac) + (src[i1] ?? 0) * frac;
    }
  }

  return result;
}
