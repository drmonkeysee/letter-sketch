import {CP_LOOKUP} from './codepage.js';

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

function getPoint(target) {
  return {
    x: parseInt(target.dataset.x, 10),
    y: parseInt(target.dataset.y, 10),
  };
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
  constructor(...args) {
    super(...args);
    this._dimensions = this.terminal.dimensions;
  }

  onMousedown(event) {
    if (this._started) return this.cleanup();
    this._started = true;
    this._start = this._end = getPoint(event.target);
    this._activeFigure = this._updateFigure(this._start, this._end);
    this._setCursor();
    return null;
  }

  onKeydown(event) {
    if (!this._started) return null;
    switch (event.key) {
      case 'Backspace':
        // TODO: back up one and remove latest tile
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
    this._clearCursor();
    // NOTE: restore the cell under the cursor on cleanup
    const cell = this.terminal.getCell(this._end.x, this._end.y);
    if (cell) {
      this.sketchpad.updateAt(this._end.x, this._end.y, cell);
    }
    return this._activeFigure;
  }

  _advanceCharacter(key) {
    // NOTE: ignore keystroke if not a valid character
    // or cursor is off the edge of the grid.
    if (this._end.y >= this._dimensions.height || !CP_LOOKUP.has(key)) return;

    this._activeFigure.advance(this._end, key);
    clearInterval(this._timer);
    this._drawFigure();
    this._advanceCursor();
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
      this._setCursor();
    } else {
      this._clearCursor();
    }
    console.log('NEW END: %o', this._end);
  }

  _setCursor() {
    this._cursorOn = true;
    this._toggleCursor();
    this._timer = setInterval(this._toggleCursor.bind(this), 600);
  }

  _clearCursor() {
    this._cursorOn = false;
    this._toggleCursor();
    clearInterval(this._timer);
  }

  _toggleCursor() {
    const cursorCell = this._cursorOn
                          ? this._activeFigure.cursorOn
                          : this._activeFigure.cursorOff;
    this.sketchpad.updateAt(this._end.x, this._end.y, cursorCell);
    this._cursorOn = !this._cursorOn;
  }
}
