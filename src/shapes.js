import {makeTile} from './models/terminal.js';

export function cellShape(brushCell, terminal) {
  return ({start}) => [makeTile(start.x, start.y, brushCell)];
}

export function floodFill(shape, brushCell, terminal) {
  // starting at tile of shape[0] execute a floodfill
  // and return new shape
}
