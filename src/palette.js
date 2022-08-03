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
const PALETTE = [
  hexToRgb('ffffff'),  // White
  hexToRgb('c0c0c0'),  // Silver
  hexToRgb('808080'),  // Gray
  hexToRgb('000000'),  // Black
  hexToRgb('ff0000'),  // Red
  hexToRgb('800000'),  // Maroon
  hexToRgb('ffff00'),  // Yellow
  hexToRgb('808000'),  // Olive
  hexToRgb('00ff00'),  // Lime
  hexToRgb('008000'),  // Green
  hexToRgb('00ffff'),  // Aqua
  hexToRgb('008080'),  // Teal
  hexToRgb('0000ff'),  // Blue
  hexToRgb('000080'),  // Navy
  hexToRgb('ff00ff'),  // Fuchsia
  hexToRgb('800080'),  // Purple
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
    BLACK: 3,
    WHITE: 0,
  },
};
