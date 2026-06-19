import type { S950Params } from '../algorithm/s950';

export function bindControls(onChange: (params: S950Params) => void): S950Params {
  const stretchInput = document.getElementById('stretch') as HTMLInputElement;
  const stretchValue = document.getElementById('stretch-value') as HTMLElement;
  const dtimeInput = document.getElementById('dtime') as HTMLInputElement;
  const dtimeValue = document.getElementById('dtime-value') as HTMLElement;
  const transposeInput = document.getElementById('transpose') as HTMLInputElement;
  const transposeValue = document.getElementById('transpose-value') as HTMLElement;

  const modeMonoBtn = document.getElementById('mode-mono') as HTMLButtonElement;
  const modePolyBtn = document.getElementById('mode-poly') as HTMLButtonElement;
  const autodOnBtn = document.getElementById('autod-on') as HTMLButtonElement;
  const autodOffBtn = document.getElementById('autod-off') as HTMLButtonElement;

  const params: S950Params = {
    stretchPercent: Number(stretchInput.value),
    dTime: Number(dtimeInput.value),
    autoD: false,
    mode: 'mono',
    transpose: Number(transposeInput.value),
  };

  const emit = () => onChange({ ...params });

  stretchInput.addEventListener('input', () => {
    params.stretchPercent = Number(stretchInput.value);
    stretchValue.textContent = stretchInput.value;
    emit();
  });

  dtimeInput.addEventListener('input', () => {
    params.dTime = Number(dtimeInput.value);
    dtimeValue.textContent = dtimeInput.value;
    emit();
  });

  transposeInput.addEventListener('input', () => {
    params.transpose = Number(transposeInput.value);
    transposeValue.textContent = transposeInput.value;
    emit();
  });

  function setMode(mode: 'mono' | 'poly') {
    params.mode = mode;
    modeMonoBtn.classList.toggle('active', mode === 'mono');
    modePolyBtn.classList.toggle('active', mode === 'poly');
    emit();
  }

  function setAutoD(autoD: boolean) {
    params.autoD = autoD;
    autodOnBtn.classList.toggle('active', autoD);
    autodOffBtn.classList.toggle('active', !autoD);
    dtimeInput.disabled = autoD;
    emit();
  }

  modeMonoBtn.addEventListener('click', () => setMode('mono'));
  modePolyBtn.addEventListener('click', () => setMode('poly'));
  autodOnBtn.addEventListener('click', () => setAutoD(true));
  autodOffBtn.addEventListener('click', () => setAutoD(false));

  return params;
}
