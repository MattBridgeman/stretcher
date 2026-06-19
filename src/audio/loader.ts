let sharedContext: AudioContext | null = null;
let activeSource: AudioBufferSourceNode | null = null;

function getAudioContext(): AudioContext {
  if (!sharedContext) {
    sharedContext = new AudioContext();
  }
  return sharedContext;
}

export async function loadAudioFile(file: File): Promise<AudioBuffer> {
  const arrayBuffer = await file.arrayBuffer();
  return getAudioContext().decodeAudioData(arrayBuffer);
}

export function stopPlayback(): void {
  if (!activeSource) return;
  activeSource.onended = null;
  activeSource.stop();
  activeSource = null;
}

export function playBuffer(buffer: AudioBuffer): AudioBufferSourceNode {
  stopPlayback();

  const ctx = getAudioContext();
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.onended = () => {
    if (activeSource === source) activeSource = null;
  };
  source.start();

  activeSource = source;
  return source;
}
