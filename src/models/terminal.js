import {Cell, HASH_WIDTH} from './cell.js';

// NOTE: max terminal size is related to hash width of tiles
const MIN_DIM = 1, MAX_DIM = 2**HASH_WIDTH;

export class Terminal {
  constructor(columns, rows) {
    this._stride = this._height = 0;
    this.resize(columns, rows);
  }

  get dimensions() { return {width: this._stride, height: this._height}; }

  resize(columns, rows) {
    if (columns < MIN_DIM || columns > MAX_DIM
        || rows < MIN_DIM || rows > MAX_DIM) {
      const msg = 'Terminal dimensions must be in range '
                    + `[${MIN_DIM}, ${MAX_DIM}];`
                    + ` got arguments {columns: ${columns}, rows: ${rows}}`;
      throw new Error(msg);
    }

    if (columns === this._stride && rows === this._height) return;

    const cells = this._newCellGrid(columns, rows);
    // NOTE: update terminal state last so the resizing operation
    // can reference previous terminal state to preserve
    // as much of the original sketch as possible.
    this._stride = columns;
    this._height = rows;
    this._cells = cells;
  }

  getCell(x, y) {
    const idx = x + (y * this._stride);
    return this._cells[idx];
  }

  updateCell(x, y, cell) {
    const targetCell = this.getCell(x, y);
    targetCell.update(cell);
  }

  update(figure) {
    for (const {x, y, cell} of figure) {
      this.updateCell(x, y, cell);
    }
  }

  _newCellGrid(columns, rows) {
    const cells = [],
          resizeColumnAdjust = Math.trunc((this._stride - columns) / 2),
          resizeRowAdjust = Math.trunc((this._height - rows) / 2);
    for (let y = 0; y < rows; ++y) {
      for (let x = 0; x < columns; ++x) {
        const resizeXAdjust = x + resizeColumnAdjust,
              resizeYAdjust = y + resizeRowAdjust,
              oldCell = this._getResizeAdjustedCell(
                resizeXAdjust, resizeYAdjust
              );
        cells.push(oldCell || new Cell());
      }
    }
    return cells;
  }

  _getResizeAdjustedCell(adjustedX, adjustedY) {
    if (adjustedX >= 0 && adjustedX < this._stride
        && adjustedY >= 0 && adjustedY < this._height) {
      return this.getCell(adjustedX, adjustedY);
    }
    return null;
  }
}
