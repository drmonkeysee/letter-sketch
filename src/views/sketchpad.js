import {View} from './view.js';
import {COMMANDS} from '../commands.js';
import {EVENTS} from '../refresh.js';

class Canvas extends View {
  constructor(...args) {
    super(...args);
    this._canvas = this._doc.getElementById('draw-surface');
    this._context = null;
  }

  draw(initialState) {
    this._canvas.style.width = initialState.styleWidth;
    this._canvas.style.height = initialState.styleHeight;

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
    this._context.textBaseline = 'middle';
    
    this._context.clearRect(0, 0, rect.width, rect.height);

    this._drawTiles(initialState);
    
    this._drawDemo(initialState);
  }

  subscribe(notifier) {
    notifier.subscribe(EVENTS.onDrawCompleted, this._drawTiles.bind(this));
  }

  _drawTiles(update) {
    const tiles = update.tiles, tileSize = update.tileSize;
    for (const tile of tiles) {
      const drawRect = {x: tile.x * tileSize.width, y: tile.y * tileSize.height, w: tileSize.width, h: tileSize.height},
            cell = tile.cell,
            glyphOffsetY = drawRect.h / 2;  // NOTE: text baseline + y-offset to line up with overlay's textContent glyphs
                                            // TODO: hope this math works cross-browser!
      if (cell.isEmpty()) {
        this._context.clearRect(drawRect.x, drawRect.y, drawRect.w, drawRect.h);
      } else {
        if (cell.backgroundColor) {
          this._context.fillStyle = cell.backgroundColor;
          this._context.fillRect(drawRect.x, drawRect.y, drawRect.w, drawRect.h);
        }
        this._context.fillStyle = cell.foregroundColor;
        this._context.fillText(cell.glyph, drawRect.x, drawRect.y + glyphOffsetY);
      }
    }
  }

  _drawDemo(initialState) {
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

class Overlay extends View {
  constructor(...args) {
    super(...args);
    this._overlay = this._doc.getElementById('ux-overlay');
    this._activeStroke = this._stroke = null;
    this._uxGrid = [];
    this._rows = this._columns = 0;
  }

  draw(initialState) {
    this._stroke = initialState.stroke;
    this._rows = initialState.termSize.height;
    this._columns = initialState.termSize.width;
    this._overlay.style.width = initialState.styleWidth;
    this._overlay.style.height = initialState.styleHeight;
    this._overlay.style.gridTemplateColumns = `repeat(${this._columns}, 1fr)`;
    
    const cellHeight = `${initialState.tileSize.height}px`,
          cellWidth = `${initialState.tileSize.width}px`,
          startEvents = ['mousedown'],
          strokeEvents = ['mouseenter', 'mouseleave', 'mouseup'];
    for (let y = 0; y < this._rows; ++y) {
      for (let x = 0; x < this._columns; ++x) {
        const uxCell = this._doc.createElement('div');
        uxCell.appendChild(this._doc.createElement('span'));

        uxCell.style.height = cellHeight;
        uxCell.style.width = cellWidth;
        uxCell.dataset.x = x;
        uxCell.dataset.y = y;

        // TODO: need a way to cancel stroke if cursor leaves draw region
        for (const e of startEvents) {
          uxCell.addEventListener(e, this._startStroke.bind(this));
        }
        for (const e of strokeEvents) {
          uxCell.addEventListener(e, this._continueStroke.bind(this));
        }
        
        this._uxGrid.push(uxCell);
        this._overlay.appendChild(uxCell);
      }
    }
  }

  _startStroke(event) {
    this._activeStroke = this._stroke(this._overlay);
    this._continueStroke(event);
  }

  _continueStroke(event) {
    if (!this._activeStroke) return;
    const shape = this._activeStroke.handleEvent(event);
    if (shape) {
      this._dispatch.command(COMMANDS.drawShape, shape);
      console.log('generated shape: %o', shape);
      console.log('clear active stroke');
      for (const tile of shape) {
        const uxCell = this._uxGrid[tile.x + (tile.y * this._columns)],
              cellText = uxCell.getElementsByTagName('span')[0];
        setTimeout(() => {
          cellText.style.color = '#ff0000';
          cellText.style.backgroundColor = '#00ff00';
          setTimeout(() => cellText.style.backgroundColor = cellText.textContent = null, 500);
        }, 500);
      }
      this._activeStroke = null;
    }
  }
}

export class SketchPad extends View {
  constructor(...args) {
    super(...args);
    this._canvas = new Canvas(...args);
    this._overlay = new Overlay(...args);
  }

  draw(initialState) {
    const styleSize = {
      styleHeight: `${initialState.termSize.height * initialState.tileSize.height}px`,
      styleWidth: `${initialState.termSize.width * initialState.tileSize.width}px`
    };
    initialState = Object.assign(styleSize, initialState);
    this._canvas.draw(initialState);
    this._overlay.draw(initialState);
  }

  subscribe(notifier) {
    this._canvas.subscribe(notifier);
  }
}
