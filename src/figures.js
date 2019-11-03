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

// NOTE: scale radius slightly past the bounding box so the grid
// snaps to a more visually well-balanced ellipse.
const RADIUS_SCALING_FACTOR = 1.05;

function ellipseHitCheck(xOrigin, yOrigin, xRadius, yRadius) {
  const xFactor = (yRadius * RADIUS_SCALING_FACTOR)**2,
        yFactor = (xRadius * RADIUS_SCALING_FACTOR)**2,
        containsThreshold = xFactor * yFactor;
  return (x, y) => {
    return (xFactor * (x - xOrigin)**2)
            + (yFactor * (y - yOrigin)**2)
            <= containsThreshold;
  };
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
    return activeFigure || [makeTile(start.x, start.y, lettertypeCell)];
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
  const dims = terminal.dimensions;

  return (start, end, activeFigure) => {
    if (activeFigure) return activeFigure;

    const visited = new Set([hashTile(start)]),
          neighborQueue = [start],
          figure = [makeTile(start.x, start.y, lettertypeCell)],
          originalCell = terminal.getCell(start.x, start.y);

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

export function ellipse(lettertypeCell, terminal) {
  const {width, height} = terminal.dimensions;

  return (start, end, activeFigure) => {
    const hRadius = end.x - start.x,
          vRadius = end.y - start.y,
          far = {x: start.x - hRadius, y: start.y - vRadius},
          inEllipse = ellipseHitCheck(start.x, start.y, hRadius, vRadius);

    return drawRect(far, end, (t, r, b, l) => {
      const figure = [];
      t = Math.max(0, t);
      r = Math.min(r, width - 1);
      b = Math.min(b, height - 1);
      l = Math.max(0, l);
      for (let y = t; y <= b; ++y) {
        let prevXHit = false;
        for (let x = l; x <= r; ++x) {
          const hit = inEllipse(x, y);
          if (y === t || y === b || x === l || x === r) {
            if (hit) {
              figure.push(makeTile(x, y, lettertypeCell));
            }
          } else {
            if (!prevXHit && hit) {
              figure.push(makeTile(x, y, lettertypeCell));
            } else if (prevXHit && !hit) {
              figure.push(makeTile(x - 1, y, lettertypeCell));
            }
          }
          prevXHit = hit;
        }
      }
      return figure;
    });
  };
}

export function filledEllipse(lettertypeCell, terminal) {
  const {width, height} = terminal.dimensions;

  return (start, end, activeFigure) => {
    const hRadius = end.x - start.x,
          vRadius = end.y - start.y,
          far = {x: start.x - hRadius, y: start.y - vRadius},
          inEllipse = ellipseHitCheck(start.x, start.y, hRadius, vRadius);

    return drawRect(far, end, (t, r, b, l) => {
      const figure = [];
      t = Math.max(0, t);
      r = Math.min(r, width - 1);
      b = Math.min(b, height - 1);
      l = Math.max(0, l);
      for (let y = t; y <= b; ++y) {
        for (let x = l; x <= r; ++x) {
          if (inEllipse(x, y)) {
            figure.push(makeTile(x, y, lettertypeCell));
          }
        }
      }
      return figure;
    });
  };
}
