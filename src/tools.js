import {
  singleCell, freeDraw, floodFill, rectangle, filledRectangle,
  ellipse, filledEllipse,
} from './figures.js';
import {MouseGesture} from './gestures.js';
import namemap from './namemap.js';

function makeTool(models, gestureCls, figureStyle) {
  return {
    startGesture(sketchpadView) {
      return new gestureCls(
        figureStyle(models.lettertype.cell, models.terminal),
        sketchpadView,
        models.terminal
      );
    },
  };
}

const TOOLS_REGISTRY = {
  point(models) {
    return makeTool(models, MouseGesture, singleCell);
  },
  brush(models) {
    return makeTool(models, MouseGesture, freeDraw);
  },
  fill(models) {
    return makeTool(models, MouseGesture, floodFill);
  },
  rect(models) {
    return makeTool(models, MouseGesture, rectangle);
  },
  fillRect(models) {
    return makeTool(models, MouseGesture, filledRectangle);
  },
  ellipse(models) {
    return makeTool(models, MouseGesture, ellipse);
  },
  fillEllipse(models) {
    return makeTool(models, MouseGesture, filledEllipse);
  },
  line(models) {/* line segment from start to end using current lettertype, use smart lines? */},
  text(models) {/* type text */},
  replace(models) {/* swap all tiles matching current point with current lettertype */},
};

export const TOOLS = namemap(Object.values(TOOLS_REGISTRY), (name, t) => name);

export function currentTool(models) {
  const tool = TOOLS_REGISTRY[models.currentTool];
  if (!tool) throw new Error(`Unknown tool: ${models.currentTool}`);
  return tool(models);
}
