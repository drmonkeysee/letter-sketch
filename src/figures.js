import {makeTile} from './models/terminal.js';

export function singleCell(brushCell, terminal) {
  return (start, end, activeFigure) => {
    return [makeTile(start.x, start.y, brushCell)];
  }
}

// TODO: remove duplicate tiles when going over same cells
export function freeDraw(brushCell, terminal) {
  return (start, end, activeFigure) => {
    activeFigure = activeFigure || [];
    activeFigure.push(makeTile(end.x, end.y, brushCell));
    return activeFigure;
  };
}

export function floodFill(brushCell, terminal) {
  // at start execute a floodfill
  // and return new figure
}

export function rectangle(brushCell, terminal) {
  return (start, end, previousShape) => {
    // draw rectangle, including restoration of last state? how to measure last state?
    return [];
  }
}
