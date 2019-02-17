class Stroke {
  constructor(shape, sketchpad) {
    this._generateShape = shape;
    this._sketchpad = sketchpad;
    this._currentShape = [];
  }

  handleEvent(event) {
    const eventName = event.type.replace(event.type[0], event.type[0].toUpperCase()),
          handlerName = `on${eventName}`;
    if (this[handlerName]) return this[handlerName](event);
    return null;
  }

  get currentShape() {
    return this._currentShape;
  }

  _drawShape(shape) {
    for (const tile of shape) {
      this._sketchpad.updateAt(tile.x, tile.y, tile.cell);
      this._currentShape.push(tile);
    }
  }
}

function getPoint(target) {
  return {x: parseInt(target.dataset.x, 10), y: parseInt(target.dataset.y, 10)};
}

export class PointStroke extends Stroke {
  onMousedown(event) {
    const point = getPoint(event.target),
          shape = this._generateShape(point);
    this._drawShape(shape);
    return this._currentShape;
  }
}

export class ContinualStroke extends Stroke {
  onMousedown(event) {
    const point = getPoint(event.target),
          shape = this._generateShape(point);
    this._drawShape(shape);
    return null;
  }

  onMouseover(event) {
    const point = getPoint(event.target),
          shape = this._generateShape(point);
    this._drawShape(shape);
    return null;
  }

  onMouseup(event) {
    return this._currentShape;
  }
}

export class SegmentStroke extends Stroke {
  onMousedown(event) {
    this._start = getPoint(event.target);
    const shape = this._generateShape(this._start, this._start);
    this._drawShape(shape);
    return null;
  }

  onMouseover(event) {
    const point = getPoint(event.target),
          shape = this._generateShape(this._start, point);
    this._drawShape(shape);
    return null;
  }

  onMouseup(event) {
    return this._currentShape;
  }
}
