import {
  boxDraw, boxRectangle, ellipse, filledEllipse, filledRectangle, floodFill,
  freeDraw, lineSegment, rectangle, replace, singleCell, textBuffer,
} from './figures.js';
import {CursorGesture, MouseGesture, SampleCell} from './gestures.js';

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

  committed() {
    this._gesture = null;
  }

  cleanup(update) {
    this.committed(update);
    return null;
  }

  _createGesture(sketchpadView) {
    return new this.gestureCls(
      // Curry the figure with the current cell and match gesture's
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

  committed() {
    this._gesture = this._pendingGesture;
    this._pendingGesture = null;
  }

  cleanup() {
    const figure = this._gesture.cleanup();
    this._gesture = this._pendingGesture = null;
    return figure;
  }
}

class EyedropTool extends Tool {
  constructor(models) {
    // empty figure used to terminate gesture immediately
    super(models, SampleCell, () => []);
  }
}

const TOOLS_REGISTRY = {
  point: {
    name: 'Single Cell',
    shortcut: {
      key: 'c',
    },
    make(models) {
      return new Tool(models, MouseGesture, singleCell);
    },
  },
  brush: {
    name: 'Free Draw',
    shortcut: {
      key: 'p',
    },
    make(models) {
      return new Tool(models, MouseGesture, freeDraw);
    },
  },
  boxBrush: {
    name: 'Box Draw',
    shortcut: {
      key: 'b',
    },
    make(models) {
      return new Tool(models, MouseGesture, boxDraw);
    },
  },
  eraser: {
    name: 'Eraser',
    shortcut: {
      key: 'e',
    },
    make(models) {
      return new Tool(models, MouseGesture, freeDraw);
    },
  },
  rect: {
    name: 'Rectangle',
    shortcut: {
      key: 'r',
    },
    make(models) {
      return new Tool(models, MouseGesture, rectangle);
    },
  },
  fillRect: {
    name: 'Filled Rectangle',
    shortcut: {
      key: 'r',
      shift: true,
    },
    make(models) {
      return new Tool(models, MouseGesture, filledRectangle);
    },
  },
  boxRect: {
    name: 'Box Rectangle',
    shortcut: {
      key: 'b',
      shift: true,
    },
    make(models) {
      return new Tool(models, MouseGesture, boxRectangle);
    },
  },
  line: {
    name: 'Line',
    shortcut: {
      key: 'l',
    },
    make(models) {
      return new Tool(models, MouseGesture, lineSegment);
    },
  },
  ellipse: {
    name: 'Ellipse',
    shortcut: {
      key: 'o',
    },
    make(models) {
      return new Tool(models, MouseGesture, ellipse);
    },
  },
  fillEllipse: {
    name: 'Filled Ellipse',
    shortcut: {
      key: 'o',
      shift: true,
    },
    make(models) {
      return new Tool(models, MouseGesture, filledEllipse);
    },
  },
  text: {
    name: 'Text',
    shortcut: {
      key: 't',
    },
    make(models) {
      return new TextTool(models);
    },
  },
  swap: {
    name: 'Replace',
    shortcut: {
      key: 's',
    },
    make(models) {
      return new Tool(models, MouseGesture, replace);
    },
  },
  eyedrop: {
    name: 'Eyedrop',
    shortcut: {
      key: 'd',
    },
    make(models) {
      return new EyedropTool(models);
    },
  },
  fill: {
    name: 'Fill',
    shortcut: {
      key: 'f',
    },
    make(models) {
      return new Tool(models, MouseGesture, floodFill);
    },
  },
  undo: {
    name: 'Undo',
    shortcut: {
      key: 'z',
    },
    make(models) {
      return new Tool(models, MouseGesture, singleCell);
    },
  },
  redo: {
    name: 'Redo',
    shortcut: {
      key: 'y',
    },
    make(models) {
      return new Tool(models, MouseGesture, singleCell);
    },
  },
};

const NAMES = Object.fromEntries(
  Object.entries(TOOLS_REGISTRY).map(([k, v]) => [k, v.name])
);

const SHORTCUTS = Object.fromEntries(
  Object.entries(TOOLS_REGISTRY).map(([k, v]) => {
    const sc = v.shortcut;
    return [sc.shift ? sc.key.toUpperCase() : sc.key, k];
  })
);

export const TOOLS = Object.fromEntries(
  Object.keys(TOOLS_REGISTRY).map(k => [k, k])
);

export function toolName(tool) {
  return NAMES[tool];
}

export function isBoxTool(tool) {
  return tool.startsWith('box');
}

export function isEraser(tool) {
  return tool === 'eraser';
}

export function isTextTool(tool) {
  return tool === 'text';
}

export function currentTool(models) {
  const tool = TOOLS_REGISTRY[models.currentTool];
  if (!tool) throw new Error(`Unknown tool: ${models.currentTool}`);
  return tool.make(models);
}

export function toolShortcut(tool) {
  const entry = TOOLS_REGISTRY[tool];
  if (!entry) throw new Error(`Unknown tool: ${tool}`);
  return entry.shortcut;
}

export function toolFromShortcut(key, shift) {
  return SHORTCUTS[shift ? key.toUpperCase() : key];
}
