import {makeTile} from './models/cell.js';

class ActiveFigure {
  constructor() {
    this._tiles = [];
    this._points = new Set();
  }

  addTile(tile) {
    // NOTE: shift/xor works as a key cuz terminal dimensions
    // cannot be greater than 0xffff
    const tilePosition = (tile.x << 16) ^ tile.y;
    if (!this._points.has(tilePosition)) {
      this._tiles.push(tile);
      this._points.add(tilePosition);
    }
  }

  *[Symbol.iterator]() {
    yield* this._tiles;
  }
}

export function singleCell(brushCell, terminal) {
  return (start, end, activeFigure) => {
    return [makeTile(start.x, start.y, brushCell)];
  };
}

// TODO: remove duplicate tiles when going over same cells
// set of indices based on x,y?
export function freeDraw(brushCell, terminal) {
  return (start, end, activeFigure) => {
    activeFigure = activeFigure || new ActiveFigure();
    activeFigure.addTile(makeTile(end.x, end.y, brushCell));
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
  };
}
