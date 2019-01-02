export class Terminal {
  constructor(columns, rows) {
    this.resize(columns, rows);
  }

  get dimensions() {
    return {height: this._height, width: this._stride};
  }

  resize(columns, rows) {
    this._stride = columns;
    this._height = rows;
    const size = columns * rows, cells = [];
    for (let i = 0; i < size; ++i) {
      cells[i] = new Cell();
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
}

export class Cell {
  constructor(glyph = null, fgColor = null, bgColor = null) {
    this.glyph = glyph;
    this.foregroundColor = fgColor;
    this.backgroundColor = bgColor;
  }

  isEmpty() {
    // TODO: codepage null is actually \u0000
    return !this.glyph;
  }

  update(that) {
    this.glyph = that.glyph;
    this.foregroundColor = that.foregroundColor;
    this.backgroundColor = that.backgroundColor;
  }
}
