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

export class Point extends Stroke {
  start(x, y) {
    // generate shape
    // send command
  }
}

export class Brush extends Stroke {
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

export class Rectangle extends Stroke {
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
