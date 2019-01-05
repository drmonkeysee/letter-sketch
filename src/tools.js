import {PointStroke} from './strokes.js';
import {drawCell} from './draw.js';

// TODO: need better name for draw strategy
const pen = {
  strokeFactory(brushCell) {
    return (...args) => new PointStroke(brushCell, ...args);
  },
  drawStrategy() {
    return drawCell;
  }
};

export const TOOLS = {
  pen
};
