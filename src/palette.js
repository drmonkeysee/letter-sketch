function hexToRgb(hexString) {
  let r, g, b;
  if (hexString.length === 3) {
    [r, g, b] = hexString;
    r += r;
    g += g;
    b += b;
  } else if (hexString.length === 6) {
    r = hexString.slice(0, 2);
    g = hexString.slice(2, 4);
    b = hexString.slice(4, 6);
  } else {
    return '';
  }
  return `rgb(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)})`;
}

// NOTE: Basic 16-color Palette
// https://en.wikipedia.org/wiki/Web_colors#Basic_colors
// list taken from https://www.ditig.com/256-colors-cheat-sheet
const PALETTE = [
  'rgb(0, 0, 0)',       // Black
  'rgb(128, 0, 0)',     // Maroon
  'rgb(0, 128, 0)',     // Green
  'rgb(128, 128, 0)',   // Olive
  'rgb(0, 0, 128)',     // Navy
  'rgb(128, 0, 128)',   // Purple
  'rgb(0, 128, 128)',   // Teal
  'rgb(192, 192, 192)', // Silver
  'rgb(128, 128, 128)', // Gray
  'rgb(255, 0, 0)',     // Red
  'rgb(0, 255, 0)',     // Lime
  'rgb(255, 255, 0)',   // Yellow
  'rgb(0, 0, 255)',     // Blue
  'rgb(255, 0, 255)',   // Fuchsia
  'rgb(0, 255, 255)',   // Aqua
  'rgb(255, 255, 255)', // White
];

export default {
  * cssColors() {
    yield* PALETTE;
  },
  * enumerate() {
    yield* PALETTE.entries();
  },
  cssColor(id) {
    return PALETTE[id];
  },
  id(color) {
    if (color.startsWith('#')) {
      color = hexToRgb(color.substring(1));
    }
    return PALETTE.indexOf(color);
  },
  COLORS: {
    BLACK: 0,
    WHITE: PALETTE.length - 1,
  },
};
