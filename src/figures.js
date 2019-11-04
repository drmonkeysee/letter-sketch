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

// NOTE: Bresenham midpoint ellipse algorithm
// calculating lower-right quadrant using +x goes right and +y goes down
// https://dai.fmph.uniba.sk/upload/0/01/Ellipse.pdf
function bresenhamEllipse(rx, ry, plot) {
  const rx2 = rx**2,
        ry2 = ry**2,
        rx2Factor = 2 * rx2,
        ry2Factor = 2 * ry2;

  // TODO: figure out what to do here and for very thin long ellipses
  if (rx < 1 || ry < 1) return;

  let x = rx,
      y = 0,
      err = 0,
      dx = ry2 * (1 - (2 * rx)),
      dy = rx2,
      stopx = ry2Factor * rx,
      stopy = 0;
  while (stopx >= stopy) {
    plot(x, y++);
    stopy += rx2Factor;
    err += dy;
    dy += rx2Factor;
    if ((2 * err) + dx > 0) {
      --x;
      stopx -= ry2Factor;
      err += dx;
      dx += ry2Factor;
    }
  }

  x = 0;
  y = ry;
  err = 0;
  dx = ry2;
  dy = rx2 * (1 - (2 * ry));
  stopx = 0;
  stopy = rx2Factor * ry;
  while (stopx <= stopy) {
    plot(x++, y);
    stopx += ry2Factor;
    err += dx;
    dx += ry2Factor;
    if ((2 * err) + dy > 0) {
      --y;
      stopy -= rx2Factor;
      err += dy;
      dy += rx2Factor;
    }
  }
}

function plotEllipse(x, y, center, dims, figure, cell) {
  const {width, height} = dims,
        posX = center.x + x,
        negX = center.x - x,
        posY = center.y + y,
        negY = center.y - y;
  if (posX < width && posY < height) {
    figure.add(makeTile(posX, posY, cell));
  }
  if (negX >= 0 && posY < height) {
    figure.add(makeTile(negX, posY, cell));
  }
  if (posX < width && negY >= 0) {
    figure.add(makeTile(posX, negY, cell));
  }
  if (negX >= 0 && negY >= 0) {
    figure.add(makeTile(negX, negY, cell));
  }
}

class ActiveFigure {
  constructor() {
    this._tiles = [];
    this._points = new Set();
  }

  add(tile) {
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
    activeFigure.add(makeTile(end.x, end.y, lettertypeCell));
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
      for (let x = l; x <= r; ++x) {
        figure.push(makeTile(x, t, lettertypeCell));
        figure.push(makeTile(x, b, lettertypeCell));
      }
      for (let y = t + 1; y < b; ++y) {
        figure.push(makeTile(l, y, lettertypeCell));
        figure.push(makeTile(r, y, lettertypeCell));
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
  return (start, end, activeFigure) => {
    const xRadius = Math.abs(end.x - start.x),
          yRadius = Math.abs(end.y - start.y),
          figure = new ActiveFigure(),
          plot = (x, y) => plotEllipse(
            x, y, start, terminal.dimensions, figure, lettertypeCell
          );
    bresenhamEllipse(xRadius, yRadius, plot);
    return figure;
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
