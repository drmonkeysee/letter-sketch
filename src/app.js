import namemap from './namemap.js';
import {checkCanvas, measureGlyph} from './dom.js';
import brush from './models/brush.js';
import {Terminal, demoText} from './models/terminal.js';
import {ViewNotifier} from './refresh.js';
import dispatch from './dispatch.js';
import {VIEW_REGISTRY} from './views/index.js';
import {currentStroke} from './models/tools.js';

class App {
  constructor(win, notifier, dispatchBuilder) {
    this._win = win;
    this._doc = win.document;
    this._notifier = notifier;
    this._dispatchBuilder = dispatchBuilder;
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
    this._dispatcher = this._dispatchBuilder.build(this._models);
  }

  _createViews() {
    this._views = namemap(VIEW_REGISTRY, (n, viewCls) => new viewCls(this._doc, this._dispatcher));
  }

  _registerViews() {
    this._notifier.register(...Object.values(this._views));
  }

  _drawViews() {
    const initState = this._initialState();
    for (const v of Object.values(this._views)) {
      v.draw(initState);
    }
  }

  _initialState() {
    return {
      shape: demoText(this._models.terminal, 9, 10),
      tileSize: this._models.brush.tileSize,
      termSize: this._models.terminal.dimensions,
      stroke: currentStroke(this._models),
      glyph: this._models.brush.cell.glyph,
      colors: {
        fg: this._models.brush.cell.foregroundColor,
        bg: this._models.brush.cell.backgroundColor,
        fill: this._models.brush.fillColor
      }
    }
  }
}

let app = null;

export default {
  start(win) {
    const notifier = new ViewNotifier();
    app = new App(win, notifier, dispatch(notifier));
    app.initialize();
  }
};
