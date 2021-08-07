import codepage from './codepage.js';
import {hashTile, makeTile, Cell} from './models/cell.js';

const DIRECTIONS = {
  NONE: 0b0000,
  TOP: 0b0001,
  RIGHT: 0b0010,
  BOTTOM: 0b0100,
  LEFT: 0b1000,
};

function* neighbors(tile, dims) {
  const {x, y} = tile,
        left = x - 1,
        top = y - 1,
        right = x + 1,
        bottom = y + 1;
  if (top >= 0) yield {x, y: top, direction: DIRECTIONS.TOP};
  if (right < dims.width) yield {x: right, y, direction: DIRECTIONS.RIGHT};
  if (bottom < dims.height) yield {x, y: bottom, direction: DIRECTIONS.BOTTOM};
  if (left >= 0) yield {x: left, y, direction: DIRECTIONS.LEFT};
}

function drawRect(start, end, lettertypeCell, plotStyle) {
  const [top, bottom] = start.y < end.y
                        ? [start.y, end.y]
                        : [end.y, start.y],
        [left, right] = start.x < end.x
                        ? [start.x, end.x]
                        : [end.x, start.x];
    return plotStyle(top, right, bottom, left, lettertypeCell);
}

function plotRect(top, right, bottom, left, lettertypeCell) {
  const figure = new PlotFigure();
  for (let x = left; x <= right; ++x) {
    figure.add(makeTile(x, top, lettertypeCell));
    figure.add(makeTile(x, bottom, lettertypeCell));
  }
  for (let y = top + 1; y < bottom; ++y) {
    figure.add(makeTile(left, y, lettertypeCell));
    figure.add(makeTile(right, y, lettertypeCell));
  }
  return figure;
}

function plotBoxRect(terminal, top, right, bottom, left, lettertypeCell) {
  const figure = new BoxFigure(terminal, true);
  for (let x = left; x <= right; ++x) {
    if (x === left) {
      figure.add(makeTile(x, top,
                          new Cell(218, lettertypeCell.fgColorId,
                                   lettertypeCell.bgColorId)));
      figure.add(makeTile(x, bottom,
                          new Cell(192, lettertypeCell.fgColorId,
                                   lettertypeCell.bgColorId)));
    } else if (x === right) {
      figure.add(makeTile(x, top,
                          new Cell(191, lettertypeCell.fgColorId,
                                   lettertypeCell.bgColorId)));
      figure.add(makeTile(x, bottom,
                          new Cell(217, lettertypeCell.fgColorId,
                                   lettertypeCell.bgColorId)));
    } else {
      figure.add(makeTile(x, top,
                          new Cell(196, lettertypeCell.fgColorId,
                                   lettertypeCell.bgColorId)));
      figure.add(makeTile(x, bottom,
                          new Cell(196, lettertypeCell.fgColorId,
                                   lettertypeCell.bgColorId)));
    }
  }
  for (let y = top + 1; y < bottom; ++y) {
    figure.add(makeTile(left, y,
                        new Cell(179, lettertypeCell.fgColorId,
                                 lettertypeCell.bgColorId)));
    figure.add(makeTile(right, y,
                        new Cell(179, lettertypeCell.fgColorId,
                                 lettertypeCell.bgColorId)));
  }
  figure.solve();
  return figure;
}

function plotFilledRect(top, right, bottom, left, lettertypeCell) {
  const figure = [];
  for (let y = top; y <= bottom; ++y) {
    for (let x = left; x <= right; ++x) {
      figure.push(makeTile(x, y, lettertypeCell));
    }
  }
  return figure;
}

function drawEllipse(start, end, width, height, lettertypeCell, plotStyle) {
  const xRadius = Math.abs(end.x - start.x),
        yRadius = Math.abs(end.y - start.y),
        figure = new PlotFigure();

  if (!xRadius && !yRadius) {
    figure.add(makeTile(start.x, start.y, lettertypeCell));
  } else if (!xRadius) {
    for (let y = 0; y <= yRadius; ++y) {
      const posY = start.y + y, negY = start.y - y;
      if (posY < height) {
        figure.add(makeTile(start.x, posY, lettertypeCell));
      }
      if (negY >= 0) {
        figure.add(makeTile(start.x, negY, lettertypeCell));
      }
    }
  } else if (!yRadius) {
    for (let x = 0; x <= xRadius; ++x) {
      const posX = start.x + x, negX = start.x - x;
      if (posX < width) {
        figure.add(makeTile(posX, start.y, lettertypeCell));
      }
      if (negX >= 0) {
        figure.add(makeTile(negX, start.y, lettertypeCell));
      }
    }
  } else {
    bresenhamEllipse(xRadius, yRadius, (x, y) => plotStyle(
      x, y, start, width, height, figure, lettertypeCell
    ));
  }

  return figure;
}

// NOTE: Bresenham midpoint ellipse algorithm
// calculating lower-right quadrant using +x goes right and +y goes down.
// https://dai.fmph.uniba.sk/upload/0/01/Ellipse.pdf
function bresenhamEllipse(rx, ry, plot) {
  const rx2 = rx**2,
        ry2 = ry**2,
        rx2Factor = 2 * rx2,
        ry2Factor = 2 * ry2;

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

  // NOTE: capture the end values of x and y
  // after the first tangent arc is plotted
  // for use below in finishing thin ellipses.
  const ex = x, ey = y;

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

  // NOTE: midpoint algorithm finishes an arc too early
  // on the major axis if the minor axis is too thin.
  while (y >= ey) {
    plot(x - 1, y--);
  }
  while (x <= ex) {
    plot(x++, y);
  }
}

function plotEllipse(x, y, center, width, height, figure, cell) {
  const posX = center.x + x,
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

function plotFilledEllipse(x, y, center, width, height, figure, cell) {
  const posX = Math.min(center.x + x, width - 1),
        negX = Math.max(0, center.x - x),
        posY = Math.min(center.y + y, height - 1),
        negY = Math.max(0, center.y - y);
  for (let px = posX; px >= center.x; --px) {
    figure.add(makeTile(px, posY, cell));
    figure.add(makeTile(px, negY, cell));
  }
  for (let px = negX; px < center.x; ++px) {
    figure.add(makeTile(px, posY, cell));
    figure.add(makeTile(px, negY, cell));
  }
}

// NOTE: Bresenham line algorithm
// all-octets variant
// https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
function drawLineSegment(x0, y0, x1, y1, cell) {
  const dx = Math.abs(x1 - x0),
        dy = -Math.abs(y1 - y0),
        sx = x0 < x1 ? 1 : -1,
        sy = y0 < y1 ? 1 : -1,
        figure = new PlotFigure();
  let err = dx + dy;
  while (true) {
    figure.add(makeTile(x0, y0, cell));
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
  return figure;
}

class ActiveFigure {
  constructor() {
    this._tiles = [];
  }

  get length() { return this._tiles.length; }

  add(tile) {
    this._tiles.push(tile);
  }

  *[Symbol.iterator]() {
    yield* this._tiles;
  }
}

class PlotFigure extends ActiveFigure {
  constructor() {
    super();
    this._points = new Set();
  }

  add(tile) {
    const h = hashTile(tile);
    if (!this._points.has(h)) {
      super.add(tile);
      this._points.add(h);
    }
  }
}

class BoxFigure extends PlotFigure {
  constructor(terminal, rect) {
    super();
    this.terminal = terminal;
    this.rect = rect
  }

  solve() {
    const additionalTiles = [];
    for (const tile of this._tiles) {
      let lineConstraints = 0;
      console.log('Scanning tile (%d, %d)', tile.x, tile.y);
      for (const n of neighbors(tile, this.terminal.dimensions)) {
        const figureNeighbor = this._points.has(hashTile(n));
        const nCell = figureNeighbor
                      ? this._find(n).cell
                      : this.terminal.getCell(n.x, n.y);
        if (codepage.lines.isLine(nCell.glyphId)) {
          const compDirection = n.direction > 2
                                ? n.direction >> 2
                                : n.direction << 2;
          if (this.rect) {
            if (codepage.lines.hasAttractor(nCell.glyphId, compDirection)) {
              lineConstraints |= n.direction;
            }
          } else {
            lineConstraints |= n.direction;
            if (!figureNeighbor) {
              let nDirections = codepage.lines.getAttractors(nCell.glyphId);
              nDirections |= compDirection;
              console.log('Comp directions: %s', nDirections.toString(2).padStart(4, '0'));
              const newCell = new Cell(codepage.lines.getLineId(nDirections),
                                       nCell.fgColorId,
                                       nCell.bgColorId);
              console.log('New cell: %s (%d, %d)', codepage.glyph(newCell.glyphId), n.x, n.y);
              additionalTiles.push(makeTile(n.x, n.y, newCell));
            }
          }
        }
      }
      //console.log('(%d, %d) has directions %s', tile.x, tile.y, lineConstraints.toString(2).padStart(4, '0'))
      tile.cell.glyphId = codepage.lines.getLineId(lineConstraints);
    }
    for (const tile of additionalTiles) {
      this.add(tile);
    }
  }

  _find(tile) {
    return this._tiles.find(t => t.x === tile.x && t.y === tile.y);
  }
}

class TextFigure extends ActiveFigure {
  constructor(lettertypeCell) {
    super();
    this._fgColor = lettertypeCell.fgColorId;
    this._bgColor = lettertypeCell.bgColorId;
    this.cursorOn = new Cell(
      codepage.SIGILS.CURSOR, this._fgColor, this._bgColor
    );
    this.cursorOff = new Cell(
      codepage.SIGILS.TRANSPARENT, this._fgColor, this._bgColor
    );
  }

  advance(point, glyphId) {
    const cell = new Cell(glyphId, this._fgColor, this._bgColor);
    this.add(makeTile(point.x, point.y, cell));
  }

  // NOTE: store a newline sentinel to stay aligned with
  // the cursor position.
  newline(point) {
    this.add(makeTile(point.x, point.y, codepage.SIGILS.NEWLINE));
  }

  reverse() {
    return this._tiles.pop();
  }

  // NOTE: newline sentinels are not part of the final figure
  *[Symbol.iterator]() {
    yield* this._tiles.filter(t => t.cell !== codepage.SIGILS.NEWLINE);
  }
}

export function singleCell(lettertypeCell, terminal) {
  return (start, end, activeFigure) =>
    activeFigure || [makeTile(start.x, start.y, lettertypeCell)];
}

export function freeDraw(lettertypeCell, terminal) {
  return (start, end, activeFigure) => {
    activeFigure = activeFigure || new PlotFigure();
    activeFigure.add(makeTile(end.x, end.y, lettertypeCell));
    return activeFigure;
  };
}

export function boxDraw(lettertypeCell, terminal) {
  return (start, end, activeFigure) => {
    activeFigure = activeFigure || new BoxFigure(terminal, false);
    // TODO: don't create cell on every draw
    activeFigure.add(makeTile(end.x, end.y,
                              new Cell(196,
                                       lettertypeCell.fgColorId,
                                       lettertypeCell.bgColorId)));
    activeFigure.solve();
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
  return (start, end, activeFigure) => drawRect(
    start, end, lettertypeCell, plotRect
  );
}

export function filledRectangle(lettertypeCell, terminal) {
  return (start, end, activeFigure) => drawRect(
    start, end, lettertypeCell, plotFilledRect
  );
}

export function boxRectangle(lettertypeCell, terminal) {
  return (start, end, activeFigure) => drawRect(
    start, end, lettertypeCell, (...args) => plotBoxRect(terminal, ...args)
  );
}

export function ellipse(lettertypeCell, terminal) {
  const {width, height} = terminal.dimensions;
  return (start, end, activeFigure) => drawEllipse(
    start, end, width, height, lettertypeCell, plotEllipse
  );
}

export function filledEllipse(lettertypeCell, terminal) {
  const {width, height} = terminal.dimensions;
  return (start, end, activeFigure) => drawEllipse(
    start, end, width, height, lettertypeCell, plotFilledEllipse
  );
}

export function lineSegment(lettertypeCell, terminal) {
  return (start, end, activeFigure) => drawLineSegment(
    start.x, start.y, end.x, end.y, lettertypeCell
  );
}

export function textBuffer(lettertypeCell, terminal) {
  return (start, end, activeFigure) =>
    activeFigure || new TextFigure(lettertypeCell);
}

export function replace(lettertypeCell, terminal) {
  const {width, height} = terminal.dimensions;
  return (start, end, activeFigure) => {
    if (activeFigure) return activeFigure;

    const targetCell = terminal.getCell(start.x, start.y),
          figure = [];
    if (targetCell.equals(lettertypeCell)) return figure;

    for (let y = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
        const c = terminal.getCell(x, y);
        if (!c.equals(targetCell)) continue;
        figure.push(makeTile(x, y, lettertypeCell));
      }
    }
    return figure;
  };
}
