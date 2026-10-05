export const PRESETS = {
  linear: [0, 0, 1, 1],
  ease: [0.25, 0.1, 0.25, 1],
  'ease-in': [0.42, 0, 1, 1],
  'ease-out': [0, 0, 0.58, 1],
  'ease-in-out': [0.42, 0, 0.58, 1],
  back: [0.34, 1.56, 0.64, 1],
};

export function validCurve(curve) {
  return Array.isArray(curve) && curve.length === 4 && curve.every(Number.isFinite)
    && curve[0] >= 0 && curve[0] <= 1 && curve[2] >= 0 && curve[2] <= 1
    && curve[1] >= -1 && curve[1] <= 2 && curve[3] >= -1 && curve[3] <= 2;
}

export function coordinate(u, p1, p2) {
  const v = 1 - u;
  return 3 * v * v * u * p1 + 3 * v * u * u * p2 + u * u * u;
}

// CSS input time is the curve's x coordinate, not its parametric u.
// Bisection also handles valid degenerate control points with zero derivative.
export function progressAt(time, curve) {
  if (!validCurve(curve) || !Number.isFinite(time)) throw new RangeError('Invalid curve or time');
  if (time <= 0) return 0;
  if (time >= 1) return 1;
  let low = 0, high = 1;
  for (let n = 0; n < 52; n++) {
    const middle = (low + high) / 2;
    if (coordinate(middle, curve[0], curve[2]) < time) low = middle;
    else high = middle;
  }
  return coordinate((low + high) / 2, curve[1], curve[3]);
}

// Number serialization preserves the same values used by the live preview.
// Rounding here would silently change manually entered high-precision curves.
export const cssCurve = curve => `cubic-bezier(${curve.join(', ')})`;

export function exportCSS(curves, duration) {
  if (!Array.isArray(curves) || curves.length !== 2 || !curves.every(validCurve)
    || !Number.isInteger(duration) || duration < 100 || duration > 3000)
    throw new RangeError('Invalid comparison');
  return `/* Motion Bench: a shared duration; apply classes to your own elements. */\n.motion-a {\n  transition: transform ${duration}ms ${cssCurve(curves[0])};\n}\n.motion-b {\n  transition: transform ${duration}ms ${cssCurve(curves[1])};\n}\n@media (prefers-reduced-motion: reduce) {\n  .motion-a, .motion-b { transition: none; }\n}\n`;
}
