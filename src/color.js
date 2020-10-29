const COLOR_CHANNEL_MIN = 0x00, COLOR_CHANNEL_MAX = 0xff;

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

function generatePalette() {
  const colorSteps = [COLOR_CHANNEL_MIN, 0x80, COLOR_CHANNEL_MAX],
        colors = [];
  for (const redStep of colorSteps) {
    for (const greenStep of colorSteps) {
      for (const blueStep of colorSteps) {
        colors.push(`rgb(${redStep}, ${greenStep}, ${blueStep})`);
      }
    }
  }
  return colors;
}

const PALETTE = generatePalette();

export default {
  *cssColors() {
    yield* PALETTE;
  },
  *enumerate() {
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
    black: 0,
    white: PALETTE.length - 1,
  },
};
