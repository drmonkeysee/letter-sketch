import {PointStroke, ContinualStroke, SegmentStroke} from '../strokes.js';
import {singleCell, rectangle} from '../shapes.js';

const point = {
  createStroke(models) {
    return {
      start(sketchpadView) {
        return new PointStroke(singleCell(models.brush.cell, models.terminal), sketchpadView);
      }
    }
  }
};

const pen = {
  createStroke(models) {
    return {
      start(sketchpadView) {
        return new ContinualStroke(singleCell(models.brush.cell, models.terminal), sketchpadView);
      }
    }
  }
}

const rect = {
  createStroke(models) {
    return {
      start(sketchpadView) {
        return new SegmentStroke(rectangle(models.brush.cell, models.terminal), sketchpadView);
      }
    }
  }
}

const TOOLS = {
  point,
  pen,
  fill: {/* floodfill (cardinal) all tiles matching current point with current brush */},
  rect: {/* draw border rect using current brush, use smart lines if single or double line selected */},
  fillRect: {/* filled rect using current brush */},
  ellipse: {/* draw border ellipse using current brush, use smart lines if single or double line selected */},
  fillEllipse: {/* filled ellipse using current brush */},
  line: {/* line segment from start to end using current brush, use smart lines? */},
  text: {/* type text */},
  replace: {/* swap all tiles matching current point with current brush */}
};

export function currentStroke(models) {
  const tool = TOOLS[models.currentTool];
  if (!tool) throw new Error(`Unknown tool: ${models.currentTool}`);
  return tool.createStroke(models);
}
