import {NULL_GLPYH} from '../codepage.js';

// TODO: remove direct accessors so it's easier to pass cells around without worrying about accidental modification
export class Cell {
  constructor(glyph = null, fgColor = null, bgColor = null) {
    this.glyph = glyph || NULL_GLPYH;
    this.foregroundColor = fgColor;
    this.backgroundColor = bgColor;
  }

  isEmpty() {
    return this.glyph === NULL_GLPYH;
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
