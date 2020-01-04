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
    this._start = getPoint(event.target);
    this._setCursor();
    return null;
  }

  // TODO: move the cell definitions and advancement to custom active figure
  onKeydown(event) {
    this._activeFigure = this._updateFigure(
      this._start, this._end, this._activeFigure
    );
    const latest = this._activeFigure[this._activeFigure.length - 1];
    latest.cell.glyph = event.key;
    if (this._timer) {
      clearInterval(this._timer);
    }
    this._drawFigure();
    this._setCursor();
    return null;
  }

  _setCursor() {
    if (this._end) {
      this._end = {x: this._end.x + 1, y: this._end.y};
    } else {
      this._end = this._start;
    }
    this._currentCell = this._terminal.getCell(
      this._end.x, this._end.y
    );
    this._cursor = this._currentCell.clone();
    this._cursor.glyph = '|';
    this._cursorOn = false;
    this._toggleCursor();
    this._timer = setInterval(this._toggleCursor.bind(this), 600);
  }

  _toggleCursor() {
    const cursorUpdate = this._cursorOn ? this._currentCell : this._cursor;
    this._sketchpad.updateAt(this._end.x, this._end.y, cursorUpdate);
    this._cursorOn = !this._cursorOn;
  }
}
