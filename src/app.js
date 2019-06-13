import lettertype from './models/lettertype.js';
import {Terminal} from './models/terminal.js';
import {ViewNotifier} from './refresh.js';
import {CommandDispatcher} from './commands.js';
import {VIEW_REGISTRY} from './views/index.js';
import {currentTool, TOOLS} from './tools.js';

class App {
  constructor(win) {
    this._win = win;
    this._doc = win.document;
    this._notifier = new ViewNotifier();
    this._models = {};
  }

  initialize() {
    this._createModels();
    this._wireCommands();
    this._createViews();
    this._registerViews();
    this._drawViews();

    console.log('started letter-sketch');
  }

  _createModels() {
    this._models.lettertype = lettertype();
    this._models.terminal = new Terminal(50, 20);
    this._models.currentTool = TOOLS.brush;
  }

  _wireCommands() {
    this._dispatch = new CommandDispatcher(this._notifier, this._models);
  }

  _createViews() {
    this._views = VIEW_REGISTRY.map(viewCls => new viewCls(this._doc, this._dispatch));
  }

  _registerViews() {
    this._notifier.register(...this._views);
  }

  _drawViews() {
    const initialState = this._initialState();
    for (const v of this._views) {
      v.draw(initialState);
    }
  }

  _initialState() {
    return {
      fontSize: this._models.lettertype.fontSize,
      tileSize: this._models.lettertype.tileSize,
      terminal: this._models.terminal,
      toolName: this._models.currentTool,
      tool: currentTool(this._models),
      glyph: this._models.lettertype.cell.glyph,
      colors: {
        fg: this._models.lettertype.cell.foregroundColor,
        bg: this._models.lettertype.cell.backgroundColor
      }
    };
  }
}

export default function () {
  let app;
  return {
    start(win) {
      app = new App(win);
      app.initialize();
    }
  };
}
