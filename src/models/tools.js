import {PointStroke} from '../strokes.js';
import {drawCell} from '../draw.js';

// TODO: need better name for draw strategy
const pen = {
  strokeFactory(models) {
    return (...args) => new PointStroke(models.currentBrush.cell, ...args);
  },
  drawStrategy() {
    return drawCell;
  }
};

const TOOLS = {
  pen
};

export function currentStroke(models) {
  const tool = TOOLS[models.currentTool];
  if (!tool) throw new Error(`Unknown tool: ${models.currentTool}`);
  return tool.strokeFactory(models);
}
