import test from 'node:test';
import assert from 'node:assert/strict';
import { PRESETS, validCurve, progressAt, exportCSS } from './model.mjs';
const near = (actual, expected, tolerance = 1e-10) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
test('CSS linear time remains linear even though parametric u is nonlinear', () => {
  for (let n = 0; n <= 100; n++) near(progressAt(n / 100, PRESETS.linear), n / 100);
});
test('analytical degenerate x=u cubed distinguishes input time from parameter', () => {
  near(progressAt(0.125, [0, 1, 0, 1]), 0.875);
  near(progressAt(0.125, [0, 0, 0, 1]), 0.5);
});
test('ease-in and ease-out are mirrored in time', () => {
  for (let n = 0; n <= 100; n++) near(progressAt(n / 100, PRESETS['ease-out']), 1 - progressAt(1 - n / 100, PRESETS['ease-in']));
});
test('overshoot is preserved, and endpoints are exact for every preset', () => {
  assert.ok(progressAt(0.75, PRESETS.back) > 1);
  for (const curve of Object.values(PRESETS)) {
    assert.equal(progressAt(0, curve), 0); assert.equal(progressAt(1, curve), 1);
  }
});
test('invalid input cannot corrupt the comparison or create invalid CSS', () => {
  for (const curve of [[-0.1, 0, 1, 1], [0, 0, 1.1, 1], [0, NaN, 1, 1], [0, 0, 1], [0, 3, 1, 1]]) {
    assert.equal(validCurve(curve), false); assert.throws(() => progressAt(0.5, curve), RangeError);
  }
  assert.throws(() => progressAt(NaN, PRESETS.ease), RangeError);
  for (const curves of [null, [], [PRESETS.ease], [PRESETS.ease, PRESETS.ease, PRESETS.ease]])
    assert.throws(() => exportCSS(curves, 1000), RangeError);
});
test('export keeps both exact curves and common duration with a static alternative', () => {
  const result = exportCSS([PRESETS['ease-in'], PRESETS.back], 600);
  assert.match(result, /transform 600ms cubic-bezier\(0.42, 0, 1, 1\)/);
  assert.match(result, /transform 600ms cubic-bezier\(0.34, 1.56, 0.64, 1\)/);
  assert.match(result, /prefers-reduced-motion: reduce/);
  assert.match(result, /transition: none/);
});
test('manual control-point precision survives CSS export without rounding', () => {
  const curve = [0.333333, -0.12567, 0.678901, 1.23456];
  const result = exportCSS([curve, PRESETS.linear], 1000);
  const restored = result.match(/cubic-bezier\(([^)]+)\)/)[1].split(',').map(Number);
  assert.deepEqual(restored, curve);
  for (let n = 0; n <= 100; n++) near(progressAt(n / 100, restored), progressAt(n / 100, curve));
});
