import {
  singleCell, freeDraw, floodFill, rectangle, filledRectangle,
  ellipse, filledEllipse, lineSegment, textBuffer, replace
} from './figures.js';
import {MouseGesture, CursorGesture, SampleCell} from './gestures.js';
import namemap from './namemap.js';

class Tool {
  constructor(models, gestureCls, figureStyle) {
    this.models = models;
    this.gestureCls = gestureCls;
    this.figureStyle = figureStyle;
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
      this.figureStyle(this.models.lettertype.cell, this.models.terminal),
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
    // NOTE: empty figureStyle used to terminate gesture immediately
    super(models, SampleCell, () => () => []);
  }
}

const TOOLS_REGISTRY = {
  point(models) {
    return new Tool(models, MouseGesture, singleCell);
  },
  brush(models) {
    return new Tool(models, MouseGesture, freeDraw);
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
