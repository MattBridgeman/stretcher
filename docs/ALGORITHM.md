# Stretcher — Algorithm Reference

## Akai S950 Time Stretch

The S950 used a **cyclic time-stretch** algorithm. It divides audio into small repeating cycles (grains) and either repeats or skips them to lengthen or shorten a sample — without changing pitch. The primitive nature of this approach is what gives it the characteristic metallic, digital sound.

---

## Authentic S950 Controls

These are the parameter names exactly as they appeared on the Akai S950 hardware:

| Parameter | Range | Default | Description |
|---|---|---|---|
| **STRETCH %** | 1% – 999% | 200% | How much to stretch (>100%) or compress (<100%) the sample. 200% = twice as long. |
| **D-TIME** | 1 – ~2000 | 1000 | Controls cycle/grain length. Short values → metallic artefacts. Long values → tremolo effect. `AUTO-D` overrides this. |
| **AUTO-D** | ON / OFF | — | When ON, the S950 automatically selects a suitable D-TIME value (like autoloop). |
| **MODE** | MONO / POLY | — | `MONO` (`Monl`) suits single sustained tones. `POLY` (`Pol2`) suits drums, vocals, chords. |

Akaizer adds one extra control not on the hardware:

| Parameter | Range | Default | Description |
|---|---|---|---|
| **TRANSPOSE** | -36 – +36 semitones | 0 | Pitch shift applied independently of time stretch. |

---

## Algorithm: Cyclic Repeat/Skip

```
Input audio
  └─ Split into fixed-size cycles of length D-TIME (in samples)
       │
       ├─ STRETCH % > 100% (longer):
       │    Repeat cycles: output = ceil(inputCycles × ratio)
       │    Cycles are duplicated at evenly-spaced intervals
       │
       └─ STRETCH % < 100% (shorter):
            Skip cycles: output = floor(inputCycles × ratio)
            Cycles are dropped at evenly-spaced intervals

Output audio = reassembled cycles → new sample at original pitch
```

### Crossfade

A short crossfade at cycle boundaries reduces clicks. The S950 applies a minimal fade — keeping artefacts intentionally audible, especially at extreme ratios.

### MONO vs POLY

- **MONO**: cycles are taken from a single position in the waveform — works well when the cycle aligns with the pitch period.
- **POLY**: cycles are taken across the whole waveform regardless of pitch — suited to complex material where no single period exists.

---

## Implementation Plan (`s950.ts`)

```typescript
export interface S950Params {
  stretchPercent: number;   // 1–999, default 200
  dTime: number;            // grain length in ms, default 1000 (mapped from S950 units)
  autoD: boolean;           // auto-select dTime
  mode: 'mono' | 'poly';
  transpose: number;        // semitones, -36 to +36
}

export function s950Stretch(
  input: AudioBuffer,
  params: S950Params
): AudioBuffer;
```

**Steps:**
1. If `autoD` is ON: compute `dTime` from sample length and ratio (matching S950 AUTO-D heuristic)
2. Convert `dTime` → samples: `grainSamples = dTime * sampleRate / 1000`
3. Slice input into grains of `grainSamples` length
4. For stretch > 100%: repeat grains at the right intervals to hit target length
5. For stretch < 100%: skip grains at the right intervals
6. Apply short linear crossfade at grain boundaries
7. If `transpose !== 0`: resample output at `2^(transpose/12)` rate using Web Audio `playbackRate`

---

## Sources

- [Akai S950 Operator's Manual — ManualsLib (p.32)](https://www.manualslib.com/manual/629018/Akai-S950.html?page=32)
- [Akai S-950 Owner's Manual — Internet Archive](https://archive.org/stream/synthmanual-akai-S950ownersmanual/S950ownersmanual_djvu.txt)
- [The Akaizer Project](https://the-akaizer-project.blogspot.com/)
