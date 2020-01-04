import {CLEAR_GLYPH} from '../codepage.js';

export class Cell {
  constructor(glyph, fgColor, bgColor) {
    this._setFields(glyph, fgColor, bgColor);
  }

  get glyph() { return this._glyph; }
  set glyph(value) { this._glyph = value || CLEAR_GLYPH; }

  isEmpty() {
    return this.glyph === CLEAR_GLYPH;
  }

  equals(other) {
    return this.glyph === other.glyph
      && this.foregroundColor === other.foregroundColor
      && this.backgroundColor === other.backgroundColor;
  }

  clone() {
    return new Cell(this.glyph, this.foregroundColor, this.backgroundColor);
  }

  update({
    glyph = this.glyph,
    foregroundColor = this.foregroundColor,
    backgroundColor = this.backgroundColor,
  } = {}) {
    this._setFields(glyph, foregroundColor, backgroundColor);
  }

  _setFields(glyph, fgColor, bgColor) {
    this.glyph = glyph;
    this.foregroundColor = fgColor;
    this.backgroundColor = bgColor;
  }
}

export function makeTile(x, y, cell) {
  return {x, y, cell};
}
