import codepage from './codepage.js';
import {hashTile} from './models/cell.js';

function getPoint(target) {
  return {
    x: parseInt(target.dataset.x, 10),
    y: parseInt(target.dataset.y, 10),
  };
}

const CURSOR_INTERVAL_MS = 600;

class Cursor {
  constructor(onState, offState, draw, restore) {
    this.onState = onState;
    this.offState = offState;
    this.draw = draw;
    this.restore = restore;
    this._on = false;
  }

  get position() { return this._position; }

  set(point) {
    clearInterval(this._timer);
    this._start(point);
  }

  reset(point) {
    this._on = false;
    clearInterval(this._timer);
    this.restore(this.position);
    if (point) {
      this._start(point);
    }
  }

  clear() {
    clearInterval(this._timer);
  }

  _start(point) {
    this._on = true;
    // NOTE: copy point to prevent external updates
    this._position = {...point};
    this._toggle();
    this._timer = setInterval(this._toggle.bind(this), CURSOR_INTERVAL_MS);
  }

  _toggle() {
    this.draw(
      this.position.x, this.position.y, this._on ? this.onState : this.offState
    );
    this._on = !this._on;
  }
}

class Gesture {
  constructor(updateFigure, sketchpad, terminal) {
    this.updateFigure = updateFigure;
    this.sketchpad = sketchpad;
    this.terminal = terminal;
    this._started = false;
  }

  handleEvent(event) {
    const eventName = event.type.replace(
            event.type[0], event.type[0].toUpperCase()
          ),
          handlerName = `on${eventName}`;
    if (this[handlerName]) return this[handlerName](event);
    return null;
  }
}

class DrawGesture extends Gesture {
  constructor(...args) {
    super(...args);
    this._prevDrawTiles = [];
  }

  _drawFigure() {
    const drawnTiles = new Set(), currTiles = [];
    for (const {x, y, cell} of this._activeFigure) {
      this.sketchpad.updateAt(x, y, cell)
      const tile = {x, y};
      drawnTiles.add(hashTile(tile));
      currTiles.push(tile);
    }
    // NOTE: any tiles from the previous draw frame that are not
    // touched by the current frame must be restored from the current
    // terminal state.
    // TODO: this can probably be optimized further
    for (const tile of this._prevDrawTiles) {
      if (!drawnTiles.has(hashTile(tile))) {
        const {x, y} = tile, cell = this.terminal.getCell(x, y);
        this.sketchpad.updateAt(x, y, cell);
      }
    }
    this._prevDrawTiles = currTiles;
  }
}

export class MouseGesture extends DrawGesture {
  onMousedown(event) {
    this._started = true;
    this._start = this._end = getPoint(event.target);
    this._activeFigure = this.updateFigure(
      this._start, this._end, this._activeFigure, this.terminal
    );
    this._drawFigure();
    return null;
  }

  onMouseover(event) {
    if (!this._started) return null;
    this._end = getPoint(event.target);
    this._activeFigure = this.updateFigure(
      this._start, this._end, this._activeFigure, this.terminal
    );
    this._drawFigure();
    return null;
  }

  onMouseup(event) {
    return this._activeFigure;
  }
}

export class CursorGesture extends DrawGesture {
  onMousedown(event) {
    if (this._started) return this.cleanup();
    this._started = true;
    this._dimensions = this.terminal.dimensions;
    this._activeFigure = this.updateFigure();
    this._start = this._end = getPoint(event.target);
    this._cursor = new Cursor(
      this._activeFigure.cursorOn,
      this._activeFigure.cursorOff,
      this._drawCursor.bind(this),
      this._restoreCell.bind(this)
    );
    this._cursor.set(this._start);
    console.log('START CURSOR POS: %o', this._start);
    return null;
  }

  onKeydown(event) {
    if (!this._started || event.altKey
        || event.ctrlKey || event.metaKey) return null;
    event.preventDefault();
    switch (event.key) {
      case 'Backspace':
        this._reverseCharacter();
        break;
      case 'Enter':
        this._newline();
        break;
      case 'Escape':
        return this.cleanup();
      case ' ':
        // NOTE: convert plain space (ClEAR GLYPH) to
        // cursor off state (TRANSPARENT GLYPH)
        // in order to preserve background color.
        this._advanceCharacter(this._cursor.offState.glyphId);
        break;
      default:
        this._advanceCharacter(codepage.id(event.key));
        break;
    }
    return null;
  }

  cleanup() {
    if (!this._started) return null;
    this._cursor.reset();
    return this._activeFigure;
  }

  get _isValidPosition() {
    return this._end.y >= 0 && this._end.y < this._dimensions.height;
  }

  _advanceCharacter(glyphId) {
    // NOTE: ignore keystroke if not a valid character
    // or cursor is off the edge of the grid.
    if (!this._isValidPosition || glyphId < 0) return;

    this._activeFigure.advance(this._end, glyphId);
    this._advanceCursor();
    this._drawFigure();
  }

  _advanceCursor() {
    let {x: newX, y: newY} = this._end;
    ++newX;
    if (newX >= this._dimensions.width) {
      newX = 0;
      ++newY;
    }
    // NOTE: always set `end` even when out of bounds to allow
    // the cursor to "leave" the sketchpad area, otherwise
    // the user can't type up to the end of the grid.
    this._end = {x: newX, y: newY};
    if (newY < this._dimensions.height) {
      this._cursor.set(this._end);
    } else {
      this._cursor.clear();
    }
    console.log('NEW CURSOR POS: %o', this._end);
  }

  _reverseCharacter() {
    const tile = this._activeFigure.reverse();
    if (tile) {
      this._end = {x: tile.x, y: tile.y};
      this._cursor.reset(this._end);
    }
    console.log('REVERSE CURSOR POS: %o', this._end);
  }

  _newline() {
    this._activeFigure.newline(this._end);
    let newY = this._end.y + 1;
    if (newY < this._dimensions.height) {
      this._end = {x: this._start.x, y: newY};
      this._cursor.reset(this._end);
    }
    console.log('NL CURSOR POS: %o', this._end);
  }

  _drawCursor(x, y, state) {
    this.sketchpad.updateAt(x, y, state);
  }

  _restoreCell(point) {
    const cell = this.terminal.getCell(point.x, point.y);
    this.sketchpad.updateAt(point.x, point.y, cell);
  }
}

export class SampleCell extends Gesture {
  onMouseup(event) {
    this._started = true;
    event.stopPropagation();
    const point = getPoint(event.target);
    // NOTE: mouseup may fire outside sketchpad, skip action if invalid point
    if (!Number.isNaN(point.x) && !Number.isNaN(point.y)) {
      this.sketchpad.commitCellSampling(
        this.terminal.getCell(point.x, point.y)
      );
    }
    return this.updateFigure();
  }
}
