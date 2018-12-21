import {makeTile} from './brush.js';

export class Terminal {
  constructor(columns, rows) {
    this.resize(columns, rows);
  }

  get dimensions() {
    return {height: this._stride, width: this._width};
  }

  resize(columns, rows) {
    this._width = columns;
    this._stride = rows;
    const size = columns * rows, cells = [];
    for (let i = 0; i < size; ++i) {
      cells[i] = makeTile(null, null, null);
    }
    this._cells = cells;
  }
}
