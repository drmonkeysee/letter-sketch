import {makeTile} from './models/cell.js';

// NOTE: shift/xor works as a key cuz terminal coordinates
// cannot be greater than 0xffff
function hashTile(tile) {
  return (tile.x << 16) ^ tile.y;
}

function* neighbors(tile, dims) {
  const {x, y} = tile,
        left = x - 1,
        top = y - 1,
        right = x + 1,
        bottom = y + 1;
  if (left >= 0) yield {x: left, y};
  if (top >= 0) yield {x, y: top};
  if (right < dims.width) yield {x: right, y};
  if (bottom < dims.height) yield {x, y: bottom};
}

function drawRect(start, end, figureStyle) {
  const [top, bottom] = start.y < end.y
                        ? [start.y, end.y]
                        : [end.y, start.y],
        [left, right] = start.x < end.x
                        ? [start.x, end.x]
                        : [end.x, start.x];
    return figureStyle(top, right, bottom, left);
}

class ActiveFigure {
  constructor() {
    this._tiles = [];
    this._points = new Set();
  }

  addTile(tile) {
    const h = hashTile(tile);
    if (!this._points.has(h)) {
      this._tiles.push(tile);
      this._points.add(h);
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
  return (start, end, activeFigure) => {
    const visited = new Set([hashTile(start)]),
          neighborQueue = [start],
          figure = [makeTile(start.x, start.y, lettertypeCell)],
          originalCell = terminal.getCell(start.x, start.y),
          dims = terminal.dimensions;

    while (neighborQueue.length > 0) {
      const current = neighborQueue.shift();
      for (const n of neighbors(current, dims)) {
        const nHash = hashTile(n);
        if (visited.has(nHash)) continue;
        visited.add(nHash);
        const neighborCell = terminal.getCell(n.x, n.y);
        if (neighborCell.equals(originalCell)) {
          figure.push(makeTile(n.x, n.y, lettertypeCell));
          neighborQueue.push(n);
        }
      }
    }

    return figure;
  };
}

export function rectangle(lettertypeCell, terminal) {
  return (start, end, activeFigure) => {
    return drawRect(start, end, (t, r, b, l) => {
      const figure = [];
      for (let y = t; y <= b; ++y) {
        if (y === t || y === b) {
          for (let x = l; x <= r; ++x) {
            figure.push(makeTile(x, y, lettertypeCell));
          }
        } else {
          figure.push(makeTile(l, y, lettertypeCell));
          figure.push(makeTile(r, y, lettertypeCell));
        }
      }
      return figure;
    });
  };
}

export function filledRectangle(lettertypeCell, terminal) {
  return (start, end, activeFigure) => {
    return drawRect(start, end, (t, r, b, l) => {
      const figure = [];
      for (let y = t; y <= b; ++y) {
        for (let x = l; x <= r; ++x) {
          figure.push(makeTile(x, y, lettertypeCell));
        }
      }
      return figure;
    });
  };
}
