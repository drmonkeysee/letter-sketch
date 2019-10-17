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

  get currentFigure() {
    return this._activeFigure || [];
  }

  _drawFigure() {
    // NOTE: on each draw refresh clear the previous frame
    // with current terminal contents before drawing the new one
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
