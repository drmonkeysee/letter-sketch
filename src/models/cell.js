import {SIGILS} from '../codepage.js';

export class Cell {
  constructor(glyphId, fgColorId, bgColorId) {
    this._setFields(glyphId, fgColorId, bgColorId);
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
      && this.fgColorId === other.fgColorId
      && this.bgColorId === other.bgColorId;
  }

  update({
    glyphId = this.glyphId,
    fgColorId = this.fgColorId,
    bgColorId = this.bgColorId,
  } = {}) {
    this._setFields(glyphId, fgColorId, bgColorId);
  }

  _setFields(glyphId, fgColorId, bgColorId) {
    this.glyphId = glyphId;
    // TODO: if clear color is removed default these for null/undefined
    this.fgColorId = fgColorId;
    this.bgColorId = bgColorId;
  }
}

export function makeTile(x, y, cell) {
  return {x, y, cell};
}
