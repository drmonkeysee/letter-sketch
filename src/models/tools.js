import {PointStroke} from '../strokes.js';
import {drawShape} from '../draw.js';

// TODO: need better name for draw strategy
const point = {
  createStroke(models) {
    return (...args) => new PointStroke(models.currentBrush.cell, ...args);
  },
  draw: drawShape
};

const TOOLS = {
  point,
  pen: {},
  fill: {},
  rect: {},
  fillRect: {},
  ellipse: {},
  fillEllipse: {},
  line: {},
  doubleLine: {},
  text: {}
};

function currentToolProperty(models, propAccessor) {
  const tool = TOOLS[models.currentTool];
  if (!tool) throw new Error(`Unknown tool: ${models.currentTool}`);
  return propAccessor(tool, models);
}

export function currentStroke(models) {
  return currentToolProperty(models, (t, m) => t.createStroke(m));
}

export function currentDraw(models) {
  return currentToolProperty(models, (t, m) => t.draw);
}
