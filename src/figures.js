import {makeTile} from './models/cell.js';

class ActiveFigure {
  constructor() {
    this._tiles = [];
    this._points = new Set();
  }

  addTile(tile) {
    // NOTE: shift/xor works as a key cuz terminal coordinates
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

export function singleCell(lettertypeCell, terminal) {
  return (start, end, activeFigure) => {
    return [makeTile(start.x, start.y, lettertypeCell)];
  };
}

export function freeDraw(lettertypeCell, terminal) {
  return (start, end, activeFigure) => {
    activeFigure = activeFigure || new ActiveFigure();
    activeFigure.addTile(makeTile(end.x, end.y, lettertypeCell));
    return activeFigure;
  };
}

export function floodFill(lettertypeCell, terminal) {
  // at start execute a floodfill
  // and return new figure
}

export function rectangle(lettertypeCell, terminal) {
  return (start, end, previousShape) => {
    // draw rectangle, including restoration of last state? how to measure last state?
    return [];
  };
}
