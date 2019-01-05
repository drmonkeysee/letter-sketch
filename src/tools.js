import {Cell} from './models/terminal.js';
import namemap from './namemap.js';
import {PointStroke} from './strokes.js';
import {drawCell} from './draw.js';

// TODO: need better name for draw strategy
class Tool {
  constructor(stroke, drawStrategy) {
    this._stroke;
    this._drawStrategy;
  }

  get stroke() {
    return this._stroke;
  }

  get drawStrategy() {
    return this._drawStrategy;
  }
}

const pen = {
  strokeFactory(currentTile) {
    return (...args) => new PointStroke(currentTile, ...args);
  }

  drawStrategy() {
    return drawCell;
  }
}

export class Pen {

}

const TOOLS_REGISTRY = [
  pen
];

export const TOOLS = namemap(TOOLS_REGISTRY, (name, t) => t);

export function demoText(terminal, x, y) {
  const text = 'Hello World! yellow & green.', textLength = text.length, sourceCell = new Cell(null, '#ff0000', '#222222'), tiles = [];
  for (let i = 0; i < textLength; ++i) {
    sourceCell.glyph = text[i];
    const targetX = x + i,
          targetCell = terminal.updateCell(targetX, y, sourceCell);
    tiles.push({
      x: targetX,
      y,
      cell: targetCell
    });
  }
  return tiles;
}
