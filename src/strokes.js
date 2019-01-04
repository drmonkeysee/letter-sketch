class Stroke {
  constructor(cmd, brushTile) {
    this._cmd = cmd;
    this._brushTile = brushTile;
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
  start(x, y) {
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
