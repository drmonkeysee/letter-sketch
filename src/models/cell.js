import {NIL_GLYPH} from '../codepage.js';

// TODO: remove direct accessors so it's easier to pass cells around without worrying about accidental modification
export class Cell {
  constructor(glyph, fgColor = null, bgColor = null) {
    this.glyph = glyph || NIL_GLYPH;
    this.foregroundColor = fgColor;
    this.backgroundColor = bgColor;
  }

  isEmpty() {
    return this.glyph === NIL_GLYPH;
  }

  update(that) {
    this.glyph = that.glyph;
    this.foregroundColor = that.foregroundColor;
    this.backgroundColor = that.backgroundColor;
  }
}

export function makeTile(x, y, cell) {
  return {x, y, cell};
}
