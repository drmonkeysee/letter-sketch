class Gesture {
  constructor(figureStyle, sketchpad) {
    this._updateFigure = figureStyle;
    this._sketchpad = sketchpad;
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
    for (const tile of this._activeFigure) {
      this._sketchpad.updateAt(tile.x, tile.y, tile.cell);
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
