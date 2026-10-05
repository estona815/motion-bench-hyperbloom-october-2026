import { PRESETS, coordinate, validCurve, progressAt, cssCurve, exportCSS } from './model.mjs';
const $ = id => document.getElementById(id);
let curves = [[...PRESETS['ease-out']], [...PRESETS['ease-in-out']]];
let names = ['Ease out', 'Ease in out'], selected = 0, time = 0, duration = 1000;
let animation = 0, playing = false, origin = 0;
const fields = ['x1', 'y1', 'x2', 'y2'].map($);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
$('reduce').checked = reduced.matches;
const sx = x => 40 + x * 320, sy = y => 176 - y * 80;

function path(curve) {
  return Array.from({length:101}, (_, n) => {
    const u = n / 100;
    return `${n ? 'L' : 'M'}${sx(coordinate(u, curve[0], curve[2])).toFixed(3)} ${sy(coordinate(u, curve[1], curve[3])).toFixed(3)}`;
  }).join(' ');
}

function stop() {
  cancelAnimationFrame(animation);
  animation = 0; playing = false;
  $('play').textContent = 'Play comparison';
}

function renderMoment() {
  ['a', 'b'].forEach((letter, n) => {
    const p = progressAt(time, curves[n]);
    $(`runner-${letter}`).style.left = `${25 + p * 50}%`;
    $(`result-${letter}`).value = `${(p * 100).toFixed(1)}% movement`;
    $(`point-${letter}`).setAttribute('cx', sx(time));
    $(`point-${letter}`).setAttribute('cy', sy(p));
  });
  $('time-line').setAttribute('d', `M${sx(time)} 16V256`);
  $('scrub').value = Math.round(time * 1000);
  $('time-label').value = `${(time * 100).toFixed(1)}% elapsed`;
}

function render() {
  ['a', 'b'].forEach((letter, n) => {
    $(`curve-${letter}`).setAttribute('d', path(curves[n]));
    $(`code-${letter}`).textContent = cssCurve(curves[n]);
    $(`name-${letter}`).textContent = names[n];
    $(`choose-${letter}`).setAttribute('aria-pressed', String(n === selected));
  });
  const c = curves[selected];
  fields.forEach((field, n) => field.value = c[n]);
  $('coordinate-legend').textContent = `Curve ${selected ? 'B' : 'A'} control points`;
  $('handles').setAttribute('d', `M40 176L${sx(c[0])} ${sy(c[1])} M360 96L${sx(c[2])} ${sy(c[3])}`);
  $('handle-1').setAttribute('cx', sx(c[0])); $('handle-1').setAttribute('cy', sy(c[1]));
  $('handle-2').setAttribute('cx', sx(c[2])); $('handle-2').setAttribute('cy', sy(c[3]));
  const preset = Object.entries(PRESETS).find(([, values]) => values.every((v, n) => v === c[n]));
  $('preset').value = preset ? preset[0] : 'custom';
  $('css-output').value = exportCSS(curves, duration);
  $('play').disabled = $('reduce').checked;
  $('motion-note').textContent = $('reduce').checked
    ? 'Static mode: playback is disabled. Use Inspect a moment to compare positions without animation.'
    : 'Playback starts only when you choose Play. You can inspect every moment without animation.';
  renderMoment();
}

function frame(now) {
  time = Math.min(1, (now - origin) / duration);
  renderMoment();
  if (time >= 1) { stop(); $('status').textContent = 'Comparison finished. Both curves used the same duration.'; }
  else animation = requestAnimationFrame(frame);
}

$('play').addEventListener('click', () => {
  if ($('reduce').checked) return;
  if (playing) { stop(); $('status').textContent = 'Paused. Inspect the current moment or resume.'; return; }
  if (time >= 1) time = 0;
  playing = true; origin = performance.now() - time * duration;
  $('play').textContent = 'Pause comparison';
  $('status').textContent = 'Playing both curves at the same time and distance.';
  animation = requestAnimationFrame(frame);
});
$('scrub').addEventListener('input', () => { stop(); time = Number($('scrub').value) / 1000; renderMoment(); });
$('start').addEventListener('click', () => { stop(); time = 0; renderMoment(); $('status').textContent = 'Both previews returned to the start.'; });
$('choose-a').addEventListener('click', () => { selected = 0; $('validation').textContent = ''; render(); });
$('choose-b').addEventListener('click', () => { selected = 1; $('validation').textContent = ''; render(); });
$('preset').addEventListener('change', () => {
  const value = $('preset').value;
  if (!(value in PRESETS)) return;
  stop(); curves[selected] = [...PRESETS[value]];
  names[selected] = $('preset').selectedOptions[0].textContent;
  $('validation').textContent = ''; render();
});
fields.forEach(field => field.addEventListener('change', () => {
  const candidate = fields.map(f => f.value === '' ? NaN : Number(f.value));
  if (!validCurve(candidate)) {
    $('validation').textContent = 'Keep both X values between 0 and 1 and Y values between −1 and 2. The last valid curve is still in use.';
    return;
  }
  stop(); curves[selected] = candidate; names[selected] = 'Custom';
  $('validation').textContent = ''; render();
}));
$('duration').addEventListener('change', () => { stop(); duration = Number($('duration').value); render(); });
$('reduce').addEventListener('change', () => { stop(); render(); });
reduced.addEventListener('change', event => { if (event.matches) { stop(); $('reduce').checked = true; render(); } });
$('reset').addEventListener('click', () => {
  stop(); curves = [[...PRESETS['ease-out']], [...PRESETS['ease-in-out']]];
  names = ['Ease out', 'Ease in out']; selected = 0; time = 0; duration = 1000;
  $('duration').value = '1000'; $('reduce').checked = reduced.matches;
  $('validation').textContent = ''; $('status').textContent = 'Comparison reset.'; render();
});
$('export').addEventListener('click', () => {
  const object = URL.createObjectURL(new Blob([exportCSS(curves, duration)], {type:'text/css'}));
  const link = document.createElement('a'); link.href = object; link.download = 'motion-bench.css';
  link.click(); setTimeout(() => URL.revokeObjectURL(object), 1000);
  $('status').textContent = 'CSS download requested. Browser download settings determine its destination.';
});
render();
