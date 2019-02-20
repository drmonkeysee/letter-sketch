import {DEFAULT_GLYPH, CP437} from './codepage.js';

export function checkCanvas(doc) {
  const canvas = doc.getElementById('img-surface');
  if (!canvas.getContext) {
    const msg = 'No console support detected!';
    console.error(msg);
    throw new Error(msg);
  }
}

export function measureGlyph(doc) {
  const r = doc.getElementById('glyph-ruler');
  let dims = {
    minHeight: 100, maxHeight: 0, minWidth: 100, maxWidth: 0
  };
  dims = CP437.reduce((acc, letter) => {
    r.textContent = letter;
    const {height, width} = r.getBoundingClientRect();
    // NOTE: || operators guard against glyphs with dimensions of 0
    return {
      minHeight: Math.min(acc.minHeight, height || acc.minHeight),
      maxHeight: Math.max(acc.maxHeight, height),
      minWidth: Math.min(acc.minWidth, width || acc.minWidth),
      maxWidth: Math.max(acc.maxWidth, width)
    };
  }, dims);
  r.textContent = DEFAULT_GLYPH;
  const {height, width} = r.getBoundingClientRect();
  console.log('Font dims: %o', dims);
  console.log('Bounding rect: %o', {height, width});
  // NOTE: round to the nearest pixel to close rounding gaps
  return {height: Math.round(height), width: Math.round(width)};
}
