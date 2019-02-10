import {Cell, makeTile} from './models/terminal.js';

class Stroke {
  constructor(brushCell, sketchpad) {
    this._brushCell = brushCell;
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
          tile = makeTile(parseInt(uxCell.dataset.x, 10), parseInt(uxCell.dataset.y, 10), this._brushCell),
          txt = uxCell.getElementsByTagName('span')[0];
    txt.textContent = this._brushCell.glyph;
    txt.style.color = this._brushCell.foregroundColor;
    txt.style.backgroundColor = this._brushCell.backgroundColor;
    return [tile];
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
