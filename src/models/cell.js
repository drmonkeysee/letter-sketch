import {SIGILS} from '../codepage.js';

export class Cell {
  constructor(glyphId, fgColor, bgColor) {
    this._setFields(glyphId, fgColor, bgColor);
  }

  get glyphId() { return this._glyphId; }
  set glyphId(value) {
    this._glyphId = value === undefined || value === null
                    ? SIGILS.CLEAR
                    : value;
  }

  isEmpty() {
    return this.glyphId === SIGILS.CLEAR;
  }

  equals(other) {
    return this.glyphId === other.glyphId
      && this.foregroundColor === other.foregroundColor
      && this.backgroundColor === other.backgroundColor;
  }

  update({
    glyphId = this.glyphId,
    foregroundColor = this.foregroundColor,
    backgroundColor = this.backgroundColor,
  } = {}) {
    this._setFields(glyphId, foregroundColor, backgroundColor);
  }

  _setFields(glyphId, fgColor, bgColor) {
    this.glyphId = glyphId;
    this.foregroundColor = fgColor;
    this.backgroundColor = bgColor;
  }
}

export function makeTile(x, y, cell) {
  return {x, y, cell};
}
