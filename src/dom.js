import {DEFAULT_GLYPH} from './codepage.js';

export function checkCanvas(doc) {
  const canvas = doc.getElementById('draw-surface');
  if (!canvas.getContext) {
    const msg = 'No console support detected!';
    console.error(msg);
    throw new Error(msg);
  }
}

export function measureGlyph(doc) {
  const r = doc.getElementById('glyph-ruler');
  r.textContent = DEFAULT_GLYPH;
  const {height, width} = r.getBoundingClientRect(),
        dpr = doc.defaultView.devicePixelRatio;
  console.log('Bounding rect: %o', {height, width});
  // NOTE: round to the nearest physical pixel
  return {height: Math.round(height * dpr) / dpr, width: Math.round(width * dpr) / dpr};
}
