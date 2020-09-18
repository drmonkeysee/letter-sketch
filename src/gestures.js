import {CP_LOOKUP} from './codepage.js';

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
  constructor(figureStyle, sketchpad, terminal) {
    this.sketchpad = sketchpad;
    this.terminal = terminal;
    this._updateFigure = figureStyle;
    this._prevDrawTiles = [];
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

  _drawFigure() {
    // NOTE: on each draw refresh clear the previous frame
    // with current terminal contents before drawing the new one.
    // TODO: i hate this
    for (const {x, y} of this._prevDrawTiles) {
      const cell = this.terminal.getCell(x, y);
      this.sketchpad.updateAt(x, y, cell);
    }
    this._prevDrawTiles.length = 0;
    for (const {x, y, cell} of this._activeFigure) {
      this.sketchpad.updateAt(x, y, cell)
      this._prevDrawTiles.push({x, y});
    }
  }
}

export class MouseGesture extends Gesture {
  onMousedown(event) {
    this._started = true;
    this._start = this._end = getPoint(event.target);
    this._activeFigure = this._updateFigure(
      this._start, this._end, this._activeFigure
    );
    this._drawFigure();
    return null;
  }

  onMouseover(event) {
    if (!this._started) return null;
    this._end = getPoint(event.target);
    this._activeFigure = this._updateFigure(
      this._start, this._end, this._activeFigure
    );
    this._drawFigure();
    return null;
  }

  onMouseup(event) {
    return this._activeFigure;
  }
}

export class CursorGesture extends Gesture {
  onMousedown(event) {
    if (this._started) return this.cleanup();
    this._started = true;
    this._dimensions = this.terminal.dimensions;
    this._activeFigure = this._updateFigure();
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
        this._advanceCharacter(this._cursor.offState.glyph);
        break;
      default:
        this._advanceCharacter(event.key);
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

  _advanceCharacter(key) {
    // NOTE: ignore keystroke if not a valid character
    // or cursor is off the edge of the grid.
    if (!this._isValidPosition || !CP_LOOKUP.has(key)) return;

    this._activeFigure.advance(this._end, key);
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

class SampleCell extends Gesture {
  onMousedown(event) {
    this._started = true;
    const point = getPoint(event.target);
    this.sketchpad.commitCellSampling(this.terminal.getCell(point.x, point.y));
    return [];
  }
}
