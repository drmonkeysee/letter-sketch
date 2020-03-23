import {CP_LOOKUP} from './codepage.js';

class Gesture {
  constructor(figureStyle, sketchpad, terminal) {
    this._updateFigure = figureStyle;
    this._sketchpad = sketchpad;
    this._terminal = terminal;
    this._prevDrawTiles = [];
  }

  handleEvent(event) {
    const eventName = event.type.replace(
            event.type[0], event.type[0].toUpperCase()
          ),
          handlerName = `on${eventName}`;
    if (this[handlerName]) return this[handlerName](event);
    return null;
  }

  get currentFigure() { return this._activeFigure || []; }

  _drawFigure() {
    // NOTE: on each draw refresh clear the previous frame
    // with current terminal contents before drawing the new one.
    for (const {x, y} of this._prevDrawTiles) {
      const cell = this._terminal.getCell(x, y);
      this._sketchpad.updateAt(x, y, cell);
    }
    this._prevDrawTiles.length = 0;
    for (const {x, y, cell} of this._activeFigure) {
      this._sketchpad.updateAt(x, y, cell)
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
    this._start = this._end = getPoint(event.target);
    this._activeFigure = this._updateFigure(
      this._start, this._end, this._activeFigure
    );
    this._drawFigure();
    return null;
  }

  onMouseover(event) {
    this._end = getPoint(event.target);
    this._activeFigure = this._updateFigure(
      this._start, this._end, this._activeFigure
    );
    this._drawFigure();
    return null;
  }

  onMouseup(event) {
    return this.currentFigure;
  }
}

export class CursorGesture extends Gesture {
  onMousedown(event) {
    this._start = this._end = getPoint(event.target);
    this._activeFigure = this._updateFigure(
      this._start, this._end, this._activeFigure
    );
    this._setCursor();
    return null;
  }

  onKeydown(event) {
    // TODO: handle control characters
    // TODO: handle new mousedown events that clears old
    // gesture, commits the text, and creates new gesture
    // (or does it just move the gesture around?)
    this._activeFigure.nextKey = event.key;
    if (!CP_LOOKUP.has(this._activeFigure.nextKey)) return null;
    this._activeFigure = this._updateFigure(
      this._start, this._end, this._activeFigure
    );
    if (this._timer) {
      clearInterval(this._timer);
    }
    this._drawFigure();
    this._end = {x: this._end.x + 1, y: this._end.y};
    this._setCursor();
    return null;
  }

  _setCursor() {
    this._cursorOn = true;
    this._toggleCursor();
    this._timer = setInterval(this._toggleCursor.bind(this), 600);
  }

  _toggleCursor() {
    const cursorCell = this._cursorOn
                          ? this._activeFigure.cursorOn
                          : this._activeFigure.cursorOff;
    this._sketchpad.updateAt(this._end.x, this._end.y, cursorCell);
    this._cursorOn = !this._cursorOn;
  }
}
