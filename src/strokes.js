class Stroke {
  constructor(shape, sketchpad) {
    this._genShape = shape;
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
    const uxCell = event.target,
          point = {x: parseInt(uxCell.dataset.x, 10), y: parseInt(uxCell.dataset.y, 10)},
          txt = uxCell.getElementsByTagName('span')[0],
          shape = this._genShape({start: point});
    for (const tile of shape) {
      txt.textContent = tile.cell.glyph;
      txt.style.color = tile.cell.foregroundColor;
      txt.style.backgroundColor = tile.cell.backgroundColor;
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
