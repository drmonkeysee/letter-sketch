import {PointStroke} from '../strokes.js';
import {cellShape} from '../shapes.js';

const point = {
  createStroke(models) {
    return {
      start(...args) {
        return new PointStroke(cellShape(models.currentBrush.cell, models.terminal), ...args);
      }
    }
  }
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
  text: {},
  replace: {}
};

export function currentStroke(models) {
  const tool = TOOLS[models.currentTool];
  if (!tool) throw new Error(`Unknown tool: ${models.currentTool}`);
  return tool.createStroke(models);
}
