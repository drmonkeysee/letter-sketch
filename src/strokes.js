class Stroke {
  constructor(shape, sketchpad) {
    this._generateShape = shape;
    this._sketchpad = sketchpad;
  }

  handleEvent(event) {
    const eventName = event.type.replace(event.type[0], event.type[0].toUpperCase()),
          handlerName = `on${eventName}`;
    if (this[handlerName]) return this[handlerName](event);
    return null;
  }
}

export class PointStroke extends Stroke {
  onMousedown(event) {
    const point = {x: parseInt(event.target.dataset.x, 10), y: parseInt(event.target.dataset.y, 10)},
          shape = this._generateShape(point);
    for (const tile of shape) {
      this._sketchpad.updateAt(point.x, point.y, tile.cell);
    }
    return shape;
  }
}

export class ContinualStroke extends Stroke {
  onMousedown(event) {
    // draw current shape
  }

  onMouseover(event) {
    // continue drawing current shape
  }

  onMouseup(event) {
    // finish drawing and return shape
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
