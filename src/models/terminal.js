import {Cell, makeTile} from './cell.js';

const MIN_DIM = 1, MAX_DIM = 0x10000;

export class Terminal {
  constructor(columns, rows) {
    this.resize(columns, rows);
  }

  get dimensions() {
    return {height: this._height, width: this._stride};
  }

  resize(columns, rows) {
    if (columns < MIN_DIM || columns > MAX_DIM
        || rows < MIN_DIM || rows > MAX_DIM) {
      const msg = `Terminal dimensions must be in range [${MIN_DIM}, ${MAX_DIM}];`
                  + ` got arguments {columns: ${columns}, rows: ${rows}}`;
      throw new Error(msg);
    }
    this._stride = columns;
    this._height = rows;
    const size = columns * rows, cells = [];
    for (let i = 0; i < size; ++i) {
      cells.push(new Cell());
    }
    this._cells = cells;
  }

  getCell(x, y) {
    const idx = x + (y * this._stride);
    return this._cells[idx];
  }

  updateCell(x, y, cell) {
    const targetCell = this.getCell(x, y);
    targetCell.update(cell);
    return targetCell;
  }

  update(figure) {
    for (const tile of figure) {
      this.updateCell(tile.x, tile.y, tile.cell);
    }
  }
}

export function demoText(terminal, x, y) {
  const text = 'Hello World! yellow & green.', textLength = text.length, sourceCell = new Cell(null, '#ff0000', '#222222'), figure = [];
  for (let i = 0; i < textLength; ++i) {
    sourceCell.update({glyph: text[i]});
    const targetX = x + i,
          targetCell = terminal.updateCell(targetX, y, sourceCell);
    figure.push(makeTile(targetX, y, targetCell));
  }
  return figure;
}
