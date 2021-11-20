import {
  boxDraw, boxRectangle, ellipse, filledEllipse, filledRectangle, floodFill,
  freeDraw, lineSegment, rectangle, replace, singleCell, textBuffer,
} from './figures.js';
import {CursorGesture, MouseGesture, SampleCell} from './gestures.js';
import namemap from './namemap.js';

class Tool {
  constructor(models, gestureCls, figure) {
    this.models = models;
    this.gestureCls = gestureCls;
    this.figure = figure;
  }

  forward(sketchpadView, event) {
    if (!this._gesture) {
      this._gesture = this._createGesture(sketchpadView);
    }
    return this._gesture.handleEvent(event);
  }

  committed(update) {
    this._gesture = null;
  }

  cleanup(update) {
    this.committed(update);
    return null;
  }

  _createGesture(sketchpadView) {
    return new this.gestureCls(
      // NOTE: curry the figure with the current cell and match gesture's
      // figure-update signature.
      (t, s, e, af) => this.figure(this.models.lettertype.cell, t, s, e, af),
      sketchpadView,
      this.models.terminal
    );
  }
}

class TextTool extends Tool {
  constructor(models) {
    super(models, CursorGesture, textBuffer);
  }

  forward(sketchpadView, event) {
    const figure = super.forward(sketchpadView, event);
    if (figure) {
      this._pendingGesture = this._createGesture(sketchpadView);
      this._pendingGesture.handleEvent(event);
    }
    return figure;
  }

  committed(update) {
    this._gesture = this._pendingGesture;
    this._pendingGesture = null;
  }

  cleanup(update) {
    const figure = this._gesture.cleanup();
    this._gesture = this._pendingGesture = null;
    return figure;
  }
}

class EyedropTool extends Tool {
  constructor(models) {
    // NOTE: empty figure used to terminate gesture immediately
    super(models, SampleCell, () => []);
  }
}

const TOOLS_REGISTRY = {
  point(models) {
    return new Tool(models, MouseGesture, singleCell);
  },
  brush(models) {
    return new Tool(models, MouseGesture, freeDraw);
  },
  boxBrush(models) {
    return new Tool(models, MouseGesture, boxDraw);
  },
  fill(models) {
    return new Tool(models, MouseGesture, floodFill);
  },
  rect(models) {
    return new Tool(models, MouseGesture, rectangle);
  },
  fillRect(models) {
    return new Tool(models, MouseGesture, filledRectangle);
  },
  boxRect(models) {
    return new Tool(models, MouseGesture, boxRectangle);
  },
  ellipse(models) {
    return new Tool(models, MouseGesture, ellipse);
  },
  fillEllipse(models) {
    return new Tool(models, MouseGesture, filledEllipse);
  },
  line(models) {
    return new Tool(models, MouseGesture, lineSegment);
  },
  text(models) {
    return new TextTool(models);
  },
  swap(models) {
    return new Tool(models, MouseGesture, replace);
  },
  eyedrop(models) {
    return new EyedropTool(models);
  },
};

export const TOOLS = namemap(Object.values(TOOLS_REGISTRY), (name, t) => name);

export function currentTool(models) {
  const tool = TOOLS_REGISTRY[models.currentTool];
  if (!tool) throw new Error(`Unknown tool: ${models.currentTool}`);
  return tool(models);
}
