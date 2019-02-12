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
}

function getPoint(target) {
  return {x: parseInt(target.dataset.x, 10), y: parseInt(target.dataset.y, 10)};
}

export class PointStroke extends Stroke {
  onMousedown(event) {
    const point = getPoint(event.target),
          shape = this._generateShape(point);
    for (const tile of shape) {
      this._sketchpad.updateAt(point.x, point.y, tile.cell);
      this._currentShape.push(shape);
    }
    return this._currentShape;
  }
}

export class ContinualStroke extends Stroke {
  onMousedown(event) {
    const point = getPoint(event.target),
          shape = this._generateShape(point);
    for (const tile of shape) {
      this._sketchpad.updateAt(point.x, point.y, tile.cell);
      this._currentShape.push(tile);
    }
    return null;
  }

  onMouseover(event) {
    const point = getPoint(event.target),
          shape = this._generateShape(point);
    for (const tile of shape) {
      this._sketchpad.updateAt(point.x, point.y, tile.cell);
      this._currentShape.push(tile);
    }
    return null;
  }

  onMouseup(event) {
    const point = getPoint(event.target),
          shape = this._generateShape(point);
    for (const tile of shape) {
      this._sketchpad.updateAt(point.x, point.y, tile.cell);
      this._currentShape.push(tile);
    }
    return this._currentShape;
  }
}

export class SegmentStroke extends Stroke {
  onMousedown(event) {
    // save initial x, y
    // draw shape
  }

  onMouseover(event) {
    // clear last shape
    // send start, current points
    // draw new shape
  }

  onMouseup(event) {
    // finish drawing and return shape
  }
}
