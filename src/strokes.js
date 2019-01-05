class Stroke {
  constructor(dispatch, cmd) {
    this._dispatch;
    this._cmd = cmd;
  }

  start() {
    // do nothing
  }

  continue() {
    // do nothing
  }

  end() {
    // do nothing
  }
}

export class PointStroke extends Stroke {
  start(target, overlay, brushTile) {
    // create and return shape
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
