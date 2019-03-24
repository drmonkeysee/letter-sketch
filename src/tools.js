import {MouseGesture} from './gestures.js';
import {singleCell, freeDraw, rectangle} from './figures.js';

function makeTool(models, gestureCls, figureStyle) {
  return {
    startGesture(sketchpadView) {
      return new gestureCls(figureStyle(models.lettertype.cell, models.terminal), sketchpadView);
    }
  };
}

const TOOLS = {
  point(models) {
    return makeTool(models, MouseGesture, singleCell);
  },
  brush(models) {
    return makeTool(models, MouseGesture, freeDraw);
  },
  rect(models) {
     //{/* draw border rect using current lettertype, use smart lines if single or double line selected */},
    //return makeTool(models, SegmentStroke, rectangle);
  },
  fillRect(models) {/* filled rect using current lettertype */},
  ellipse(models) {/* draw border ellipse using current lettertype, use smart lines if single or double line selected */},
  fillEllipse(models) {/* filled ellipse using current lettertype */},
  line(models) {/* line segment from start to end using current lettertype, use smart lines? */},
  fill(models) {/* floodfill (cardinal) all tiles matching current point with current lettertype */},
  text(models) {/* type text */},
  replace(models) {/* swap all tiles matching current point with current lettertype */}
};

export function currentTool(models) {
  const tool = TOOLS[models.currentTool];
  if (!tool) throw new Error(`Unknown tool: ${models.currentTool}`);
  return tool(models);
}
