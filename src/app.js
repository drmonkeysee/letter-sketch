import namemap from './namemap.js';
import {makeBrush} from './models/brush.js';
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
    const canvas = this.doc.getElementById('sketchpad');
    if (!canvas.getContext) {
      const msg = 'No console support detected!';
      console.error(msg);
      throw new Error(msg);
    }

    this.createModels();
    this.wireCommands();
    this.createViews();
    this.registerViews();
    this.syncModels();

    console.log('started letter-sketch');
  }

  createModels() {
    this.models.currentBrush = makeBrush();
  }

  wireCommands() {
    this.dispatcher = this.dispatchBuilder.build(this.models);
  }

  createViews() {
    const views = namemap(VIEW_REGISTRY, (n, viewCls) => new viewCls(this.doc, this.dispatcher));
    for (const v of Object.values(views)) {
      v.draw();
    }
    this.views = views;
  }

  registerViews() {
    this.notifier.register(...Object.values(this.views));
  }

  // TODO: replace this with event storm on init?
  // chicken and egg, model should determine data but tile size must come from DOM
  syncModels() {
    this.models.currentBrush.tile.glyph = this.views.glyphRuler.referenceGlyph;
    this.models.currentBrush.tileSize = this.views.glyphRuler.glyphExtent;
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
