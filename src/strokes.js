import {Cell, makeTile} from './models/terminal.js';

class Stroke {
  constructor(brushCell, overlay) {
    this._brushCell = brushCell;
    this._overlay = overlay;
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
          tile = makeTile(parseInt(uxCell.dataset.x, 10), parseInt(uxCell.dataset.y), this._brushCell),
          txt = uxCell.getElementsByTagName('span')[0];
    txt.textContent = this._brushCell.glyph;
    return [tile];
  }
}

export class BrushStroke extends Stroke {
  start(x, y) {
    // start shape
  }

  continue(x, y) {
    // add to shape
  }

  end(x, y) {
    // return shape
  }
}

export class RectangleStroke extends Stroke {
  start(x, y) {
    // start rect
  }

  continue(x, y) {
    // draw rect from start to current
  }

  end(x, y) {
    // return rect
  }
}
