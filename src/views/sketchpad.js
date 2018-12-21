import {View} from './view.js';

export class SketchPad extends View {
  constructor(...args) {
    super(...args);
    this._canvas = this._doc.getElementById('draw-surface');
    this._overlay = this._doc.getElementById('ux-overlay');
    if (!this._canvas.getContext) {
      const msg = 'No console support detected!';
      console.error(msg);
      throw new Error(msg);
    }
  }

  draw(initialState) {
    const viewSize = {
      height: initialState.termSize.height * initialState.tileSize.height,
      width: initialState.termSize.width * initialState.tileSize.width,
    };
    this._overlay.style.height = this._canvas.style.height = `${viewSize.height}px`;
    this._overlay.style.width = this._canvas.style.width = `${viewSize.width}px`;
    this._drawSurface(initialState);
    this._drawUxOverlay(initialState);
  }

  subscribe(notifier) {
    // TODO
  }

  _drawSurface(initialState) {
    const rect = this._canvas.getBoundingClientRect(),
          dpr = this._doc.defaultView.devicePixelRatio || 1;
    console.log('dpr: %d, rect: %o', dpr, rect.width, rect.height);
    console.log('canvas %d w %d h', this._canvas.width, this._canvas.height);

    this._canvas.width = rect.width * dpr;
    this._canvas.height = rect.height * dpr;

    this._context = this._canvas.getContext('2d', {alpha: false});
    this._context.scale(dpr, dpr);

    const bodyStyle = this._doc.defaultView.getComputedStyle(this._doc.getElementsByTagName('body')[0]),
          fontStyle = `${bodyStyle.getPropertyValue('font-weight')} ${bodyStyle.getPropertyValue('font-size')} ${bodyStyle.getPropertyValue('font-family')}`;
    this._context.font = fontStyle;
    this._context.textBaseline = 'top';
    
    this._context.clearRect(0, 0, rect.width, rect.height);
    
    this._drawDemo(initialState);
  }

  _drawUxOverlay(initialState) {
    const cellHeight = `${initialState.tileSize.height}px`,
          cellWidth = `${initialState.tileSize.width}px`,
          columns = initialState.termSize.width,
          rows = initialState.termSize.height;

    this._overlay.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

    for (let y = 0; y < rows; ++y) {
      for (let x = 0; x < columns; ++x) {
        const uxCell = this._doc.createElement('div');
        uxCell.appendChild(this._doc.createElement('span'));
        
        uxCell.style.height = cellHeight;
        uxCell.style.width = cellWidth;
        uxCell.dataset.x = x;
        uxCell.dataset.y = y;
        
        this._overlay.appendChild(uxCell);
      }
    }
  }

  _drawDemo(initialState) {
    this._context.fillStyle = 'red';
    this._context.fillText('Hello World!', 25, 25);
    
    const glyphDims = initialState.tileSize;
    console.log('Brush dims: %o', glyphDims);

    const letters = ['A', 'a', 'W', '1', 'y', '@'],
          baseLines = ['alphabetic', 'bottom', 'hanging', 'ideographic', 'middle', 'top'],
          drawRect = {x: 60, y: 60, w: glyphDims.width, h: glyphDims.height};
    console.log('draw rect: %o', drawRect);
    this._context.strokeStyle = '#5a5a5a';
    this._context.fillStyle = 'blue';
    const blLength = baseLines.length;

    // test baselines (top places the best)
    for (let i = 0; i < blLength; ++i) {
      const xOffset = drawRect.x + (i * drawRect.w);
      this._context.strokeRect(xOffset, drawRect.y, drawRect.w, drawRect.h);
      this._context.textBaseline = baseLines[i];
      this._context.fillText('y', xOffset, drawRect.y);
    }
    
    // test varied glyphs
    drawRect.y += drawRect.h;
    console.log('draw rect: %o', drawRect);
    this._context.textBaseline = 'top';
    for (let i = 0; i < blLength; ++i) {
      const xOffset = drawRect.x + (i * drawRect.w);
      this._context.strokeRect(xOffset, drawRect.y, drawRect.w, drawRect.h);
      this._context.fillText(letters[i], xOffset, drawRect.y);
    }

    // compare to rendered as single string
    drawRect.y += drawRect.h;
    console.log('draw rect: %o', drawRect);
    for (let i = 0; i < blLength; ++i) {
      const xOffset = drawRect.x + (i * drawRect.w);
      this._context.strokeRect(xOffset, drawRect.y, drawRect.w, drawRect.h);
    }
    this._context.fillText(letters.join(''), drawRect.x, drawRect.y);

    // test round-down width
    const rdRect = Object.assign({}, drawRect);
    rdRect.y += rdRect.h;
    rdRect.w = Math.floor(rdRect.w);
    console.log('draw rect: %o', rdRect);
    this._context.textBaseline = 'top';
    for (let i = 0; i < blLength; ++i) {
      const xOffset = rdRect.x + (i * rdRect.w);
      this._context.strokeRect(xOffset, rdRect.y, rdRect.w, rdRect.h);
      this._context.fillText(letters[i], xOffset, rdRect.y);
    }

    // test round-up width
    const ruRect = Object.assign({}, drawRect);
    ruRect.y += 2 * ruRect.h;
    ruRect.w = Math.ceil(ruRect.w);
    console.log('draw rect: %o', ruRect);
    this._context.textBaseline = 'top';
    for (let i = 0; i < blLength; ++i) {
      const xOffset = ruRect.x + (i * ruRect.w);
      this._context.strokeRect(xOffset, ruRect.y, ruRect.w, ruRect.h);
      this._context.fillText(letters[i], xOffset, ruRect.y);
    }

    // test varied glyphs
    drawRect.y += 3*drawRect.h;
    console.log('draw rect: %o', drawRect);
    const weirdLetters = ['►', '↑', '←', '▼', '╩', '╗']
    for (let i = 0; i < blLength; ++i) {
      const xOffset = drawRect.x + (i * drawRect.w);
      this._context.strokeRect(xOffset, drawRect.y, drawRect.w, drawRect.h);
      this._context.fillText(weirdLetters[i], xOffset, drawRect.y);
    }

    // test varied glyphs
    drawRect.y += drawRect.h;
    console.log('draw rect: %o', drawRect);
    const connectors = ['╚', '╤', '╧', '╦', '═', '╬']
    for (let i = 0; i < blLength; ++i) {
      const xOffset = drawRect.x + (i * drawRect.w);
      this._context.strokeRect(xOffset, drawRect.y, drawRect.w, drawRect.h);
      this._context.fillText(connectors[i], xOffset, drawRect.y);
    }
  }
}
