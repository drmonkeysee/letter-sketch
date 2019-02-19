import {MouseGesture} from './gestures.js';
import {singleCell, freeDraw, rectangle} from './figures.js';

function makeTool(models, gestureCls, figureStyle) {
  return {
    startGesture(sketchpadView) {
      return new gestureCls(figureStyle(models.brush.cell, models.terminal), sketchpadView);
    }
  };
}

const TOOLS = {
  point(models) {
    return makeTool(models, MouseGesture, singleCell);
  },
  pen(models) {
    return makeTool(models, MouseGesture, freeDraw);
  },
  rect(models) {
     //{/* draw border rect using current brush, use smart lines if single or double line selected */},
    //return makeTool(models, SegmentStroke, rectangle);
  },
  fillRect(models) {/* filled rect using current brush */},
  ellipse(models) {/* draw border ellipse using current brush, use smart lines if single or double line selected */},
  fillEllipse(models) {/* filled ellipse using current brush */},
  line(models) {/* line segment from start to end using current brush, use smart lines? */},
  fill(models) {/* floodfill (cardinal) all tiles matching current point with current brush */},
  text(models) {/* type text */},
  replace(models) {/* swap all tiles matching current point with current brush */}
};

export function currentTool(models) {
  const tool = TOOLS[models.currentTool];
  if (!tool) throw new Error(`Unknown tool: ${models.currentTool}`);
  return tool(models);
}
