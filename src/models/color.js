const COLOR_CHANNEL_MIN = 0x00, COLOR_CHANNEL_MAX = 0xff;

function clamp(value) {
  return Math.max(COLOR_CHANNEL_MIN, Math.min(value, COLOR_CHANNEL_MAX));
}

function byteHex(n) {
  const s = n.toString(16);
  return n < 0x10 ? `0${s}` : s;
}

export class Color {
  static get WHITE() { return WHITE; }
  static get BLACK() { return BLACK; }
  
  constructor(r, g, b, a = COLOR_CHANNEL_MAX) {
    this._r = clamp(r);
    this._g = clamp(g);
    this._b = clamp(b);
    this._a = clamp(a);
  }
  
  get r() { return this._r; }
  get g() { return this._g; }
  get b() { return this._b; }
  get a() { return this._a; }
}

const WHITE = new Color(COLOR_CHANNEL_MAX, COLOR_CHANNEL_MAX, COLOR_CHANNEL_MAX),
      BLACK = new Color(COLOR_CHANNEL_MIN, COLOR_CHANNEL_MIN, COLOR_CHANNEL_MIN);

export function cssHexToColor(cssHex) {
  // chop the leading '#'
  if (cssHex.length % 2) {
    cssHex = cssHex.substring(1);
  }
  const step = 2,
        start = 0,
        offsetFactors = cssHex.length > 7 ? [0, 1, 2, 3] : [0, 1, 2],
        channels = offsetFactors.map(i => {
          const offset = step * i;
          return parseInt(cssHex.substring(start + offset, step + offset), 16)
        });
  return new Color(...channels);
};

export function colorToCssHex(...args) {
  let r, g, b, a;
  if (args.length == 1) {
    const color = args[0];
    [r, g, b, a] = [color.r, color.g, color.b, color.a];
  } else {
    [r, g, b, a = COLOR_CHANNEL_MAX] = args;
  }
  return `#${byteHex(r)}${byteHex(g)}${byteHex(b)}${byteHex(a)}`;
};
