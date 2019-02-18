import {NIL_GLYPH} from '../codepage.js';

export class Cell {
  constructor(glyph, fgColor, bgColor) {
    this._setFields(glyph, fgColor, bgColor);
  }

  get glyph() { return this._glyph; }
  get foregroundColor() { return this._fgColor; }
  get backgroundColor() { return this._bgColor; }

  isEmpty() {
    return this.glyph === NIL_GLYPH;
  }

  update({
    glyph = this.glyph,
    foregroundColor = this.foregroundColor,
    backgroundColor = this.backgroundColor
  } = {}) {
    this._setFields(glyph, foregroundColor, backgroundColor);
  }

  _setFields(glyph, fgColor, bgColor) {
    this._glyph = glyph || NIL_GLYPH;
    this._fgColor = fgColor || null;
    this._bgColor = bgColor || null;
  }
}

export function makeTile(x, y, cell) {
  return {x, y, cell};
}
