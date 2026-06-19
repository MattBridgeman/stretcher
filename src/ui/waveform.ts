export function drawWaveform(canvas: HTMLCanvasElement, buffer: AudioBuffer): void {
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || canvas.parentElement?.clientWidth || 300;
  const height = canvas.clientHeight || 60;

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  const data = buffer.getChannelData(0);
  const step = Math.max(1, Math.floor(data.length / width));
  const mid = height / 2;

  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = 1;
  ctx.beginPath();

  for (let x = 0; x < width; x++) {
    const start = x * step;
    let min = 1;
    let max = -1;
    for (let i = 0; i < step; i++) {
      const sample = data[start + i] ?? 0;
      if (sample < min) min = sample;
      if (sample > max) max = sample;
    }
    ctx.moveTo(x, mid + min * mid);
    ctx.lineTo(x, mid + max * mid);
  }

  ctx.stroke();
}

export function clearWaveform(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  ctx?.clearRect(0, 0, canvas.width, canvas.height);
}
