import {CommandDispatcher} from './commands.js';
import storage from './models/storage.js';
import {ViewNotifier} from './refresh.js';
import {currentTool} from './tools.js';
import {VIEW_REGISTRY} from './views/index.js';

class App {
  constructor(win) {
    this.win = win;
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
    this._models = storage.load();
  }

  _wireCommands() {
    this._dispatch = new CommandDispatcher(this._notifier, this._models);
  }

  _createViews() {
    this._views = VIEW_REGISTRY.map(
      viewCls => new viewCls(this._doc, this._dispatch)
    );
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
      colors: {
        bg: this._models.lettertype.cell.bgColorId,
        fg: this._models.lettertype.cell.fgColorId,
      },
      fontSize: this._models.lettertype.fontSize,
      glyphId: this._models.lettertype.cell.glyphId,
      boxMode: this._models.boxMode,
      terminal: this._models.terminal,
      tool: currentTool(this._models),
      toolName: this._models.currentTool,
    };
  }
}

export default function () {
  let app;
  return {
    start(win) {
      app = new App(win);
      app.initialize();
    },
  };
}
