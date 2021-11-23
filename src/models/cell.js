import codepage from '../codepage.js';
import palette from '../palette.js';

export const HASH_WIDTH = 16;

export class Cell {
  constructor(glyphId, fgColorId, bgColorId) {
    this._setFields(glyphId, fgColorId, bgColorId);
  }

  get glyphId() { return this._glyphId; }
  set glyphId(value) { this._glyphId = value ?? codepage.SIGILS.CLEAR; }

  get fgColorId() { return this._fgColorId; }
  set fgColorId(value) { this._fgColorId = value ?? palette.COLORS.BLACK; }

  get bgColorId() { return this._bgColorId; }
  set bgColorId(value) { this._bgColorId = value ?? palette.COLORS.WHITE; }

  isEmpty() {
    return this.glyphId === codepage.SIGILS.CLEAR;
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
  }) {
    this._setFields(glyphId, fgColorId, bgColorId);
  }

  clone({
    glyphId = this.glyphId,
    fgColorId = this.fgColorId,
    bgColorId = this.bgColorId,
  } = {}) {
    return new Cell(glyphId, fgColorId, bgColorId);
  }

  _setFields(glyphId, fgColorId, bgColorId) {
    this.glyphId = glyphId;
    this.fgColorId = fgColorId;
    this.bgColorId = bgColorId;
  }
}

export function makeTile(x, y, cell) {
  return {x, y, cell};
}

export function hashTile(tile) {
  return (tile.x << HASH_WIDTH) ^ tile.y;
}
