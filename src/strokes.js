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

  reset() {
    // clear overlay
  }
}

export class PointStroke extends Stroke {
  start(target, overlay, brushTile) {
    // generate shape
    // send command
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
    // end shape
    // send command
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
    // end rect
    // send command
  }
}
