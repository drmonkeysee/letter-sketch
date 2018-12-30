export function makeCell(glyph = null, fgColor = null, bgColor = null) {
  return {
    glyph: glyph,
    foregroundColor: fgColor,
    backgroundColor: bgColor
  };
}

export class Terminal {
  constructor(columns, rows) {
    this.resize(columns, rows);
    const y = 10, x = 9, text = 'Hello World!', color = '#ff0000', textLength = text.length;
    for (let i = 0; i < textLength; ++i) {
      const cell = this._getCell(x + i, y);
      cell.glyph = text[i];
      cell.foregroundColor = color;
    }
  }

  get dimensions() {
    return {height: this._height, width: this._stride};
  }

  resize(columns, rows) {
    this._stride = columns;
    this._height = rows;
    const size = columns * rows, cells = [];
    for (let i = 0; i < size; ++i) {
      cells[i] = makeCell();
    }
    this._cells = cells;
  }

  _getCell(x, y) {
    const idx = x + (y * this._stride);
    return this._cells[idx];
  }
}
