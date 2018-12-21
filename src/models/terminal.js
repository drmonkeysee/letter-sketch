import {makeTile} from './brush.js';

// TODO: can i store glyphs only and move tiles up into view?
export class Terminal {
  constructor(columns, rows) {
    this.resize(columns, rows);
    const y = 10, x = 9, text = 'Hello World!', color = '#ff0000', textLength = text.length;
    for (let i = 0; i < textLength; ++i) {
      const tile = this._getTile(x + i, y);
      tile.glyph = text[i];
      tile.foregroundColor = color;
    }
  }

  get dimensions() {
    return {height: this._height, width: this._stride};
  }

  resize(columns, rows) {
    this._stride = columns;
    this._height = rows;
    const size = columns * rows, tiles = [];
    for (let i = 0; i < size; ++i) {
      tiles[i] = makeTile(null, null, null);
    }
    this._tiles = tiles;
  }

  _getTile(x, y) {
    const idx = x + (y * this._stride);
    return this._tiles[idx];
  }
}
