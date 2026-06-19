import { s950Stretch, type S950Params } from './algorithm/s950';
import { loadAudioFile, playBuffer } from './audio/loader';
import { exportWav } from './audio/exporter';
import { bindDropzone } from './ui/dropzone';
import { drawWaveform } from './ui/waveform';
import { bindControls } from './ui/controls';

const dropzone = document.getElementById('dropzone') as HTMLElement;
const fileInput = document.getElementById('file-input') as HTMLInputElement;
const inputCanvas = document.getElementById('input-waveform') as HTMLCanvasElement;
const outputCanvas = document.getElementById('output-waveform') as HTMLCanvasElement;
const previewBtn = document.getElementById('preview-btn') as HTMLButtonElement;
const exportBtn = document.getElementById('export-btn') as HTMLButtonElement;
const installBtn = document.getElementById('install-btn') as HTMLButtonElement;

let inputBuffer: AudioBuffer | null = null;
let outputBuffer: AudioBuffer | null = null;
let params: S950Params;

function recompute(): void {
  if (!inputBuffer) return;
  outputBuffer = s950Stretch(inputBuffer, params);
  drawWaveform(outputCanvas, outputBuffer);
  previewBtn.disabled = false;
  exportBtn.disabled = false;
}

params = bindControls((next) => {
  params = next;
  recompute();
});

bindDropzone(dropzone, fileInput, async (file) => {
  inputBuffer = await loadAudioFile(file);
  drawWaveform(inputCanvas, inputBuffer);
  recompute();
});

previewBtn.addEventListener('click', () => {
  if (outputBuffer) playBuffer(outputBuffer);
});

exportBtn.addEventListener('click', () => {
  if (outputBuffer) exportWav(outputBuffer);
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {
      // offline support is best-effort; ignore registration failures
    });
  });
}

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
}

let deferredInstallPrompt: InstallPromptEvent | null = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e as InstallPromptEvent;
  installBtn.hidden = false;
});

installBtn.addEventListener('click', async () => {
  if (!deferredInstallPrompt) return;
  await deferredInstallPrompt.prompt();
  deferredInstallPrompt = null;
  installBtn.hidden = true;
});
