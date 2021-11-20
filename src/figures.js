import {
  DIRECTIONS, getLineSet, hasAttractor, interpolateLineSet,
} from './boxchars.js';
import codepage from './codepage.js';
import {Cell, hashTile, makeTile} from './models/cell.js';

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

function plotFilledRect(top, right, bottom, left, lettertypeCell) {
  const figure = [];
  for (let y = top; y <= bottom; ++y) {
    for (let x = left; x <= right; ++x) {
      figure.push(makeTile(x, y, lettertypeCell));
    }
  }
  return figure;
}

function plotBoxRect(
  terminal, lineSet, top, right, bottom, left, lettertypeCell
) {
  const figure = new BoxRectFigure(terminal, lineSet);
  for (let x = left; x <= right; ++x) {
    if (x === left) {
      figure.add(makeTile(x, top, lettertypeCell.clone(
        {glyphId: lineSet.getId(DIRECTIONS.RIGHT | DIRECTIONS.DOWN)}
      )));
      figure.add(makeTile(x, bottom, lettertypeCell.clone(
        {glyphId: lineSet.getId(DIRECTIONS.TOP | DIRECTIONS.RIGHT)}
      )));
    } else if (x === right) {
      figure.add(makeTile(x, top, lettertypeCell.clone(
        {glyphId: lineSet.getId(DIRECTIONS.BOTTOM | DIRECTIONS.LEFT)}
      )));
      figure.add(makeTile(x, bottom, lettertypeCell.clone(
        {glyphId: lineSet.getId(DIRECTIONS.TOP | DIRECTIONS.LEFT)}
      )));
    } else {
      figure.add(makeTile(x, top, lettertypeCell.clone(
        {glyphId: lineSet.getId(DIRECTIONS.RIGHT | DIRECTIONS.LEFT)}
      )));
      figure.add(makeTile(x, bottom, lettertypeCell.clone(
        {glyphId: lineSet.getId(DIRECTIONS.RIGHT | DIRECTIONS.LEFT)}
      )));
    }
  }
  for (let y = top + 1; y < bottom; ++y) {
    figure.add(makeTile(left, y, lettertypeCell.clone(
      {glyphId: lineSet.getId(DIRECTIONS.TOP | DIRECTIONS.BOTTOM)}
    )));
    figure.add(makeTile(right, y, lettertypeCell.clone(
      {glyphId: lineSet.getId(DIRECTIONS.TOP | DIRECTIONS.BOTTOM)}
    )));
  }
  figure.solve();
  return figure;
}

function drawEllipse(start, end, dims, lettertypeCell, plotStyle) {
  const xRadius = Math.abs(end.x - start.x),
        yRadius = Math.abs(end.y - start.y),
        figure = new PlotFigure();

  if (!xRadius && !yRadius) {
    figure.add(makeTile(start.x, start.y, lettertypeCell));
  } else if (!xRadius) {
    for (let y = 0; y <= yRadius; ++y) {
      const posY = start.y + y, negY = start.y - y;
      if (posY < dims.height) {
        figure.add(makeTile(start.x, posY, lettertypeCell));
      }
      if (negY >= 0) {
        figure.add(makeTile(start.x, negY, lettertypeCell));
      }
    }
  } else if (!yRadius) {
    for (let x = 0; x <= xRadius; ++x) {
      const posX = start.x + x, negX = start.x - x;
      if (posX < dims.width) {
        figure.add(makeTile(posX, start.y, lettertypeCell));
      }
      if (negX >= 0) {
        figure.add(makeTile(negX, start.y, lettertypeCell));
      }
    }
  } else {
    bresenhamEllipse(xRadius, yRadius, (x, y) => plotStyle(
      x, y, start, dims.width, dims.height, figure, lettertypeCell
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

  _find(tile) {
    return this._findin(tile, this._tiles);
  }

  _findin(tile, tiles) {
    return tiles.find(t => t.x === tile.x && t.y === tile.y);
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
      this._insert(tile, h);
    }
  }

  _insert(tile, hash) {
    super.add(tile);
    this._points.add(hash);
  }
}

class BoxCharFigure extends PlotFigure {
  constructor(terminal, lineSet) {
    super();
    this.terminal = terminal;
    this.lineSet = lineSet;
  }
}

class BoxRectFigure extends BoxCharFigure {
  solve() {
    for (const tile of this._tiles) {
      let lineConstraints = 0, lineSet = this.lineSet;
      for (const n of neighbors(tile, this.terminal.dimensions)) {
        [lineConstraints, lineSet] = this._solveNeighborConstraints(
          n, lineConstraints, lineSet
        );
      }
      tile.cell.glyphId = lineSet.getId(lineConstraints);
    }
  }

  _solveNeighborConstraints(n, lineConstraints, lineSet) {
    const nTile = this._find(n),
          nCell = nTile?.cell ?? this.terminal.getCell(n.x, n.y);
    if (hasAttractor(nCell.glyphId, DIRECTIONS.complement(n.direction))) {
      lineConstraints |= n.direction;
      // NOTE: if neighbor is not part of this rect, give the neighbor's
      // line-set precedence in the interpolation by phase-shifting the
      // direction; this gives a more consistent visual effect than the
      // "normal" interpolation.
      if (!nTile) {
        lineSet = interpolateLineSet(
          this.lineSet, DIRECTIONS.rotate(n.direction), nCell.glyphId
        );
      }
    }
    return [lineConstraints, lineSet];
  }
}

class BoxDrawFigure extends BoxCharFigure {
  add(tile) {
    tile = this._resolveTile(tile);
    const additionalTiles = [];
    let lineConstraints = 0;
    for (const n of neighbors(tile, this.terminal.dimensions)) {
      lineConstraints = this._processNeighbor(
        n, lineConstraints, additionalTiles
      );
      tile.cell.glyphId = this.lineSet.getId(lineConstraints);
    }
    for (const adt of additionalTiles) {
      super.add(adt);
    }
  }

  _resolveTile(tile) {
    const h = hashTile(tile);
    if (this._points.has(h)) {
      // NOTE: current tile may have been pulled into the figure from the
      // terminal by an earlier tile and still has its old colors; make sure
      // the tile currently under the brush always reflects the currently-
      // selected colors.
      const currentTile = this._find(tile);
      currentTile.cell.update(
        {fgColorId: tile.cell.fgColorId, bgColorId: tile.cell.bgColorId}
      );
      tile = currentTile;
    } else {
      // NOTE: if current brush is adding a new cell, duplicate the lettertype
      // selection to render the correct box-drawing glyph.
      tile.cell = tile.cell.clone(
        {glyphId: this.lineSet.getId(DIRECTIONS.RIGHT | DIRECTIONS.LEFT)}
      );
      this._insert(tile, h);
    }
    return tile;
  }

  _processNeighbor(n, lineConstraints, additionalTiles) {
    let nTile = this._find(n) ?? this._findin(n, additionalTiles);
    const nCell = nTile?.cell ?? this.terminal.getCell(n.x, n.y),
          nLineSet = nTile ? this.lineSet : interpolateLineSet(
            this.lineSet, n.direction, nCell.glyphId
          );
    if (nLineSet) {
      lineConstraints |= n.direction;
      if (!nTile) {
        const newCell = nCell.clone(
          {glyphId: nLineSet.getId(DIRECTIONS.RIGHT | DIRECTIONS.LEFT)}
        );
        nTile = makeTile(n.x, n.y, newCell);
        additionalTiles.push(nTile);
      }
      let nConstraints = DIRECTIONS.complement(n.direction);
      for (const nn of neighbors(nTile, this.terminal.dimensions)) {
        nConstraints = this._processNeighborOfNeighbor(
          nn, nConstraints, additionalTiles
        );
      }
      nTile.cell.glyphId = nLineSet.getId(nConstraints);
    }
    return lineConstraints;
  }

  _processNeighborOfNeighbor(nn, nConstraints, additionalTiles) {
    const existingNN = this._find(nn)
                        ?? this._findin(nn, additionalTiles),
          nnCell = existingNN?.cell ?? this.terminal.getCell(nn.x, nn.y),
          nnAttractor = hasAttractor(
            nnCell.glyphId, DIRECTIONS.complement(nn.direction)
          );
    if (nnAttractor) {
      nConstraints |= nn.direction;
    }
    return nConstraints;
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

export function singleCell(lettertypeCell, start, end, activeFigure) {
  return activeFigure ?? [makeTile(start.x, start.y, lettertypeCell)];
}

export function freeDraw(lettertypeCell, start, end, activeFigure) {
  activeFigure = activeFigure ?? new PlotFigure();
  activeFigure.add(makeTile(end.x, end.y, lettertypeCell));
  return activeFigure;
}

export function boxDraw(lettertypeCell, start, end, activeFigure, terminal) {
  const lineSet = getLineSet(lettertypeCell.glyphId);
  activeFigure = activeFigure
                  ?? (lineSet
                      ? new BoxDrawFigure(terminal, lineSet)
                      : new PlotFigure());
  activeFigure.add(makeTile(end.x, end.y, lettertypeCell));
  return activeFigure;
}

export function floodFill(lettertypeCell, start, end, activeFigure, terminal) {
  if (activeFigure) return activeFigure;

  const visited = new Set([hashTile(start)]),
        neighborQueue = [start],
        figure = [makeTile(start.x, start.y, lettertypeCell)],
        originalCell = terminal.getCell(start.x, start.y);

  while (neighborQueue.length > 0) {
    const current = neighborQueue.shift();
    for (const n of neighbors(current, terminal.dimensions)) {
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
}

export function rectangle(lettertypeCell, start, end) {
  return drawRect(start, end, lettertypeCell, plotRect);
}

export function filledRectangle(lettertypeCell, start, end) {
  return drawRect(start, end, lettertypeCell, plotFilledRect);
}

export function boxRectangle(
  lettertypeCell, start, end, activeFigure, terminal
) {
  const lineSet = getLineSet(lettertypeCell.glyphId);
  return drawRect(
    start,
    end,
    lettertypeCell,
    lineSet
      ? (...args) => plotBoxRect(terminal, lineSet, ...args)
      : plotRect
  );
}

export function ellipse(lettertypeCell, start, end, activeFigure, terminal) {
  return drawEllipse(
    start, end, terminal.dimensions, lettertypeCell, plotEllipse
  );
}

export function filledEllipse(
  lettertypeCell, start, end, activeFigure, terminal
) {
  return drawEllipse(
    start, end, terminal.dimensions, lettertypeCell, plotFilledEllipse
  );
}

export function lineSegment(lettertypeCell, start, end) {
  return drawLineSegment(start.x, start.y, end.x, end.y, lettertypeCell);
}

export function textBuffer(lettertypeCell, start, end, activeFigure) {
  return activeFigure ?? new TextFigure(lettertypeCell);
}

export function replace(lettertypeCell, start, end, activeFigure, terminal) {
  if (activeFigure) return activeFigure;

  const targetCell = terminal.getCell(start.x, start.y), figure = [];
  if (targetCell.equals(lettertypeCell)) return figure;

  const {width, height} = terminal.dimensions;
  for (let y = 0; y < height; ++y) {
    for (let x = 0; x < width; ++x) {
      const c = terminal.getCell(x, y);
      if (!c.equals(targetCell)) continue;
      figure.push(makeTile(x, y, lettertypeCell));
    }
  }
  return figure;
}
