import {PointStroke, ContinualStroke, SegmentStroke} from './strokes.js';
import {singleCell, rectangle} from './shapes.js';

function makeTool(models, gesture, figureGenerator) {
  return {
    startGesture(sketchpadView) {
      return new gesture(figureGenerator(models.brush.cell, models.terminal), sketchpadView);
    }
  }
}

const TOOLS = {
  point: ms => makeTool(ms, PointStroke, singleCell),
  pen: ms =>  makeTool(ms, ContinualStroke, singleCell),
  fill: ms => {/* floodfill (cardinal) all tiles matching current point with current brush */},
  rect: ms => makeTool(ms, SegmentStroke, rectangle), //{/* draw border rect using current brush, use smart lines if single or double line selected */},
  fillRect: ms => {/* filled rect using current brush */},
  ellipse: ms => {/* draw border ellipse using current brush, use smart lines if single or double line selected */},
  fillEllipse: ms => {/* filled ellipse using current brush */},
  line: ms => {/* line segment from start to end using current brush, use smart lines? */},
  text: ms => {/* type text */},
  replace: ms => {/* swap all tiles matching current point with current brush */}
};

export function currentTool(models) {
  const tool = TOOLS[models.currentTool];
  if (!tool) throw new Error(`Unknown tool: ${models.currentTool}`);
  return tool(models);
}
