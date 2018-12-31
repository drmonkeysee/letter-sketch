import {Cell} from './models/terminal.js';

export function demoText(terminal, x, y) {
  const text = 'Hello World! yellow & green.', textLength = text.length, sourceCell = new Cell(null, '#ff0000', '#222222'), tileMap = [];
  for (let i = 0; i < textLength; ++i) {
    sourceCell.glyph = text[i];
    const targetX = x + i,
          targetCell = terminal.updateCell(targetX, y, sourceCell);
    tileMap.push({
      x: targetX,
      y: y,
      cell: targetCell
    });
  }
  return tileMap;
}
