const COLOR_CHANNEL_MIN = 0, COLOR_CHANNEL_MAX = 255;

function clamp(value) {
  return Math.max(COLOR_CHANNEL_MIN, Math.min(value, COLOR_CHANNEL_MAX));
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

export class Brush {
  constructor(glyph, bgColor, fgColor) {
    this.glyph = glyph;
    this.backgroundColor = bgColor;
    this.foregroundColor = fgColor;
  }
}
