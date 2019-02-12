import {makeTile} from './models/terminal.js';

export function singleCell(brushCell, terminal) {
  return (point) => [makeTile(point.x, point.y, brushCell)];
}

export function floodFill(brushCell, terminal) {
  // starting at tile of shape[0] execute a floodfill
  // and return new shape
}
