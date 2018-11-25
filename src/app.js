import makeNameMap from './namemap.js';
import {makeBrush} from './models/brush.js';
import {ViewNotifier} from './refresh.js';
import createDispatch from './dispatch.js';
import {VIEW_REGISTRY} from './views/index.js';

class App {
  constructor(win, notifier, createDispatch) {
    this.win = win;
    this.doc = win.document;
    this.notifier = notifier;
    this.createDispatch = createDispatch;
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

    const rect = canvas.getBoundingClientRect(),
          dpr = this.win.devicePixelRatio || 1;
    console.log('dpr: %d, rect: %o', dpr, rect.width, rect.height);
    console.log('canvas %d w %d h', canvas.width, canvas.height);

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d', {alpha: false});
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);
    
    const bodyStyle = this.win.getComputedStyle(this.doc.getElementsByTagName('body')[0]),
          fontStyle = `${bodyStyle.getPropertyValue('font-weight')} ${bodyStyle.getPropertyValue('font-size')} ${bodyStyle.getPropertyValue('font-family')}`;
    ctx.font = fontStyle;
    ctx.fillStyle = 'red';
    ctx.fillText('Hello World!', 25, 25);
    
    const glyphDims = this.models.currentBrush.tileSize;
    console.log('Brush dims: %o', glyphDims);

    const letters = ['A', 'a', 'W', '1', 'y', '@'],
          baseLines = ['alphabetic', 'bottom', 'hanging', 'ideographic', 'middle', 'top'],
          drawRect = {x: 60, y: 60, w: glyphDims.width, h: glyphDims.height};
    console.log('draw rect: %o', drawRect);
    ctx.strokeStyle = '#5a5a5a';
    ctx.fillStyle = 'blue';
    const blLength = baseLines.length;

    // test baselines (top places the best)
    for (let i = 0; i < blLength; ++i) {
      const xOffset = drawRect.x + (i * drawRect.w);
      ctx.strokeRect(xOffset, drawRect.y, drawRect.w, drawRect.h);
      ctx.textBaseline = baseLines[i];
      ctx.fillText('y', xOffset, drawRect.y);
    }
    
    // test varied glyphs
    drawRect.y += drawRect.h;
    console.log('draw rect: %o', drawRect);
    ctx.textBaseline = 'top';
    for (let i = 0; i < blLength; ++i) {
      const xOffset = drawRect.x + (i * drawRect.w);
      ctx.strokeRect(xOffset, drawRect.y, drawRect.w, drawRect.h);
      ctx.fillText(letters[i], xOffset, drawRect.y);
    }

    // compare to rendered as single string
    drawRect.y += drawRect.h;
    console.log('draw rect: %o', drawRect);
    for (let i = 0; i < blLength; ++i) {
      const xOffset = drawRect.x + (i * drawRect.w);
      ctx.strokeRect(xOffset, drawRect.y, drawRect.w, drawRect.h);
    }
    ctx.fillText(letters.join(''), drawRect.x, drawRect.y);

    // test round-down width
    const rdRect = Object.assign({}, drawRect);
    rdRect.y += rdRect.h;
    rdRect.w = Math.floor(rdRect.w);
    console.log('draw rect: %o', rdRect);
    ctx.textBaseline = 'top';
    for (let i = 0; i < blLength; ++i) {
      const xOffset = rdRect.x + (i * rdRect.w);
      ctx.strokeRect(xOffset, rdRect.y, rdRect.w, rdRect.h);
      ctx.fillText(letters[i], xOffset, rdRect.y);
    }

    // test round-up width
    const ruRect = Object.assign({}, drawRect);
    ruRect.y += 2 * ruRect.h;
    ruRect.w = Math.ceil(ruRect.w);
    console.log('draw rect: %o', ruRect);
    ctx.textBaseline = 'top';
    for (let i = 0; i < blLength; ++i) {
      const xOffset = ruRect.x + (i * ruRect.w);
      ctx.strokeRect(xOffset, ruRect.y, ruRect.w, ruRect.h);
      ctx.fillText(letters[i], xOffset, ruRect.y);
    }

    // test varied glyphs
    drawRect.y += 3*drawRect.h;
    console.log('draw rect: %o', drawRect);
    const weirdLetters = ['►', '↑', '←', '▼', '╩', '╗']
    for (let i = 0; i < blLength; ++i) {
      const xOffset = drawRect.x + (i * drawRect.w);
      ctx.strokeRect(xOffset, drawRect.y, drawRect.w, drawRect.h);
      ctx.fillText(weirdLetters[i], xOffset, drawRect.y);
    }

    // test varied glyphs
    drawRect.y += drawRect.h;
    console.log('draw rect: %o', drawRect);
    const connectors = ['╚', '╤', '╧', '╦', '═', '╬']
    for (let i = 0; i < blLength; ++i) {
      const xOffset = drawRect.x + (i * drawRect.w);
      ctx.strokeRect(xOffset, drawRect.y, drawRect.w, drawRect.h);
      ctx.fillText(connectors[i], xOffset, drawRect.y);
    }
  }

  createModels() {
    this.models.currentBrush = makeBrush();
  }

  wireCommands() {
    this.dispatcher = this.createDispatch(this.notifier, this.models);
  }

  createViews() {
    const views = makeNameMap(VIEW_REGISTRY, (n, viewCls) => new viewCls(this.doc, this.dispatcher));
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
    app = new App(win, new ViewNotifier(), createDispatch);
    app.initialize();
  }
};
