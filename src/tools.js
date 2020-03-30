import {
  singleCell, freeDraw, floodFill, rectangle, filledRectangle,
  ellipse, filledEllipse, lineSegment, textBuffer
} from './figures.js';
import {MouseGesture, CursorGesture} from './gestures.js';
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

  start(sketchpadView) {
    if (this._gesture) {
      this._pendingGesture = this._createGesture(sketchpadView);
    } else {
      super.start(sketchpadView);
    }
  }

  forward(event) {
    const gesture = super.forward(event);
    if (this._pendingGesture) {
      this._pendingGesture.handleEvent(event);
    }
    return gesture;
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
  replace(models) {/* swap all tiles matching current point with current lettertype */},
};

export const TOOLS = namemap(Object.values(TOOLS_REGISTRY), (name, t) => name);

export function currentTool(models) {
  const tool = TOOLS_REGISTRY[models.currentTool];
  if (!tool) throw new Error(`Unknown tool: ${models.currentTool}`);
  return tool(models);
}
