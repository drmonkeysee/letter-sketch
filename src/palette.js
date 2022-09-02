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
const [NAMES, PALETTE] = (function () {
  const colors = {
    White: hexToRgb('ffffff'),
    Silver: hexToRgb('c0c0c0'),
    Gray: hexToRgb('808080'),
    Black: hexToRgb('000000'),
    Red: hexToRgb('ff0000'),
    Maroon: hexToRgb('800000'),
    Yellow: hexToRgb('ffff00'),
    Olive: hexToRgb('808000'),
    Lime: hexToRgb('00ff00'),
    Green: hexToRgb('008000'),
    Aqua: hexToRgb('00ffff'),
    Teal: hexToRgb('008080'),
    Blue: hexToRgb('0000ff'),
    Navy: hexToRgb('000080'),
    Fuchsia: hexToRgb('ff00ff'),
    Purple: hexToRgb('800080'),
  };
  return [Object.keys(colors), Object.values(colors)];
})();

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
  name(id) {
    return NAMES[id];
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
