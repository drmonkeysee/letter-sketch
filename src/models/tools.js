import {PointStroke} from '../strokes.js';
import {drawCell} from '../draw.js';

// TODO: need better name for draw strategy
const pen = {
  strokeFactory(models) {
    return (...args) => new PointStroke(models.currentBrush.cell, ...args);
  },
  drawStrategy: drawCell
};

const TOOLS = {
  pen
};

function currentToolProperty(models, propAccessor) {
  const tool = TOOLS[models.currentTool];
  if (!tool) throw new Error(`Unknown tool: ${models.currentTool}`);
  return propAccessor(tool, models);
}

export function currentStroke(models) {
  return currentToolProperty(models, (t, m) => t.strokeFactory(m));
}

export function currentDraw(models) {
  return currentToolProperty(models, (t, m) => t.drawStrategy);
}
