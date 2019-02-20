import namemap from './namemap.js';
import {checkCanvas, measureGlyph} from './dom.js';
import brush from './models/brush.js';
import {Terminal, demoText} from './models/terminal.js';
import {ViewNotifier} from './refresh.js';
import {CommandDispatcher} from './commands.js';
import {VIEW_REGISTRY} from './views/index.js';
import {currentTool} from './tools.js';

class App {
  constructor(win) {
    this._win = win;
    this._doc = win.document;
    this._notifier = new ViewNotifier();
    this._models = {};
  }

  initialize() {
    checkCanvas(this._doc);

    this._createModels();
    this._syncModels();
    this._wireCommands();
    this._createViews();
    this._registerViews();
    this._drawViews();

    console.log('started letter-sketch');
  }

  _createModels() {
    this._models.brush = brush();
    this._models.terminal = new Terminal(50, 20);
    this._models.currentTool = 'pen';
  }

  _syncModels() {
    this._models.brush.tileSize = measureGlyph(this._doc);
    console.log('Tilesize: %o', this._models.brush.tileSize);
  }

  _wireCommands() {
    this._dispatch = new CommandDispatcher(this._notifier, this._models);
  }

  _createViews() {
    this._views = namemap(VIEW_REGISTRY, (n, viewCls) => new viewCls(this._doc, this._dispatch));
  }

  _registerViews() {
    this._notifier.register(...Object.values(this._views));
  }

  _drawViews() {
    const initialState = this._initialState();
    for (const v of Object.values(this._views)) {
      v.draw(initialState);
    }
  }

  _initialState() {
    return {
      figure: demoText(this._models.terminal, 9, 10),
      tileSize: this._models.brush.tileSize,
      termSize: this._models.terminal.dimensions,
      tool: currentTool(this._models),
      glyph: this._models.brush.cell.glyph,
      colors: {
        fg: this._models.brush.cell.foregroundColor,
        bg: this._models.brush.cell.backgroundColor,
        fill: this._models.brush.fillColor
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
