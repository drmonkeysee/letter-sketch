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
