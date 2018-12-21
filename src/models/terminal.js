import {makeTile} from './brush.js';

export class Terminal {
  constructor() {
    this._width = this._stride = 0;
    this._cells = [];
  }

  resize(columns, rows) {
    this._width = columns;
    this._stride = rows;
    const size = columns * rows;
    for (let i = 0; i < size; ++i) {
      this._cells[i] = makeTile(null, null, null);
    }
  }
}
