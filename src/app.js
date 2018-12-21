import namemap from './namemap.js';
import {checkCanvas, measureGlyph} from './dom.js';
import {makeBrush} from './models/brush.js';
import {Terminal} from './models/terminal.js';
import {ViewNotifier} from './refresh.js';
import dispatch from './dispatch.js';
import {VIEW_REGISTRY} from './views/index.js';

class App {
  constructor(win, notifier, dispatchBuilder) {
    this.win = win;
    this.doc = win.document;
    this.notifier = notifier;
    this.dispatchBuilder = dispatchBuilder;
    this.models = {};
  }

  initialize() {
    checkCanvas(this.doc);

    this.createModels();
    this.syncModels();
    this.wireCommands();
    this.createViews();
    this.registerViews();
    this.drawViews();

    console.log('started letter-sketch');
  }

  createModels() {
    this.models.currentBrush = makeBrush();
    this.models.terminal = new Terminal(50, 20);
  }

  syncModels() {
    this.models.currentBrush.tileSize = measureGlyph(this.doc);
  }

  wireCommands() {
    this.dispatcher = this.dispatchBuilder.build(this.models);
  }

  createViews() {
    this.views = namemap(VIEW_REGISTRY, (n, viewCls) => new viewCls(this.doc, this.dispatcher));
  }

  registerViews() {
    this.notifier.register(...Object.values(this.views));
  }

  drawViews() {
    const initState = this.initialState();
    for (const v of Object.values(this.views)) {
      v.draw(initState);
    }
  }

  initialState() {
    return {
      tileSize: this.models.currentBrush.tileSize,
      padSize: this.models.terminal.dimensions,
      glyph: this.models.currentBrush.tile.glyph,
      colors: {
        fg: this.models.currentBrush.tile.foregroundColor,
        bg: this.models.currentBrush.tile.backgroundColor,
        fill: this.models.currentBrush.fillColor
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
