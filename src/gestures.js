import {CP_LOOKUP} from './codepage.js';

function getPoint(target) {
  return {
    x: parseInt(target.dataset.x, 10),
    y: parseInt(target.dataset.y, 10),
  };
}

const CURSOR_INTERVAL_MS = 600;

class Cursor {
  constructor(onState, offState, sketchpad, terminal, position) {
    this.onState = onState;
    this.offState = offState;
    this.sketchpad = sketchpad;
    this.terminal = terminal;
    this._dimensions = terminal.dimensions;
    this._initialPosition = this._position = position;
    this._on = false;
  }

  get position() { return this._position; }

  get isValidPosition() {
    return this._position.y >= 0 && this._position.y < this._dimensions.height;
  }

  start() {
    this._on = true;
    this._toggle();
    this._timer = setInterval(this._toggle.bind(this), CURSOR_INTERVAL_MS);
  }

  advance() {
    clearInterval(this._timer);
    let {x: newX, y: newY} = this._position;
    ++newX;
    if (newX >= this._dimensions.width) {
      newX = 0;
      ++newY;
    }
    // NOTE: always set `position` even when out of bounds to allow
    // the cursor to "leave" the sketchpad area, otherwise
    // the user can't type up to the end of the grid.
    this._position = {x: newX, y: newY};
    if (newY < this._dimensions.height) {
      this.start();
    } else {
      this.stop();
    }
    console.log('NEW CURSOR POS: %o', this._position);
  }

  reverse() {
    clearInterval(this._timer);
    let {x: newX, y: newY} = this._position;
    --newX;
    if (newX < 0) {
      newX = this._dimensions.width - 1;
      --newY;
    }
    if (newX >= this._initialPosition.x || newY > this._initialPosition.y) {
      this._restoreCell();
      this._position = {x: newX, y: newY};
    }
    this.start();
    console.log('REV CURSOR POS: %o', this._position);
  }

  stop() {
    this._on = false;
    this._toggle();
    clearInterval(this._timer);
  }

  clear() {
    this.stop();
    this._restoreCell();
  }

  _toggle() {
    this.sketchpad.updateAt(
      this._position.x,
      this._position.y,
      this._on ? this.onState : this.offState
    );
    this._on = !this._on;
  }

  _restoreCell(point) {
    const cell = this.terminal.getCell(this._position.x, this._position.y);
    if (cell) {
      this.sketchpad.updateAt(this._position.x, this._position.y, cell);
    }
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
    this._activeFigure = this._updateFigure();
    this._cursor = new Cursor(
      this._activeFigure.cursorOn,
      this._activeFigure.cursorOff,
      this.sketchpad,
      this.terminal,
      getPoint(event.target)
    );
    this._cursor.start();
    return null;
  }

  onKeydown(event) {
    if (!this._started) return null;
    switch (event.key) {
      case 'Backspace':
        this._reverseCharacter();
        break;
      case 'Enter':
        // TODO: move cursor and mark sentinal
        break;
      case 'Escape':
        return this.cleanup();
      default:
        this._advanceCharacter(event.key);
        break;
    }
    return null;
  }

  cleanup() {
    if (!this._started) return null;
    this._cursor.clear();
    return this._activeFigure;
  }

  _advanceCharacter(key) {
    // NOTE: ignore keystroke if not a valid character
    // or cursor is off the edge of the grid.
    if (!this._cursor.isValidPosition || !CP_LOOKUP.has(key)) return;

    this._activeFigure.advance(this._cursor.position, key);
    this._drawFigure();
    this._cursor.advance();
  }

  _reverseCharacter() {
    this._activeFigure.reverse();
    this._cursor.reverse();
  }
}
