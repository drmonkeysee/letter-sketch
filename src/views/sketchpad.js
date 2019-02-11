import {View} from './view.js';
import {COMMANDS} from '../commands.js';
import {EVENTS} from '../refresh.js';

export class SketchPad extends View {
  constructor(...args) {
    super(...args);
    this._sketchpad = this._doc.getElementById('sketchpad');
    this._activeStroke = this._stroke = null;
    this._grid = [];
    this._rows = this._columns = 0;
  }

  draw(initialState) {
    this._stroke = initialState.stroke;
    this._rows = initialState.termSize.height;
    this._columns = initialState.termSize.width;
    this._sketchpad.style.width = `${initialState.termSize.width * initialState.tileSize.width}px`;
    this._sketchpad.style.height = `${initialState.termSize.height * initialState.tileSize.height}px`;
    this._sketchpad.style.gridTemplateColumns = `repeat(${this._columns}, 1fr)`;
    
    const cellHeight = `${initialState.tileSize.height}px`,
          cellWidth = `${initialState.tileSize.width}px`,
          startEvents = ['mousedown'],
          strokeEvents = ['mouseenter', 'mouseleave', 'mouseup'];
    for (let y = 0; y < this._rows; ++y) {
      for (let x = 0; x < this._columns; ++x) {
        const gridCell = this._doc.createElement('div');
        gridCell.appendChild(this._doc.createElement('span'));

        gridCell.style.height = cellHeight;
        gridCell.style.width = cellWidth;
        gridCell.dataset.x = x;
        gridCell.dataset.y = y;

        // TODO: need a way to cancel stroke if cursor leaves draw region
        for (const e of startEvents) {
          gridCell.addEventListener(e, this._startStroke.bind(this));
        }
        for (const e of strokeEvents) {
          gridCell.addEventListener(e, this._continueStroke.bind(this));
        }
        
        this._grid.push(gridCell);
        this._sketchpad.appendChild(gridCell);
      }
    }
  }

  subscribe(notifier) {
    notifier.subscribe(EVENTS.onDrawCommitted, this._clearStroke.bind(this));
  }

  updateAt(x, y, cell) {
    const gridCell = this._grid[x + (y * this._columns)],
          gridText = gridCell.firstChild;
    gridText.textContent = cell.glyph;
    gridText.style.color = cell.foregroundColor;
    gridText.style.backgroundColor = cell.backgroundColor;
  }

  _startStroke(event) {
    this._activeStroke = this._stroke.start(this);
    this._continueStroke(event);
  }

  _continueStroke(event) {
    if (!this._activeStroke) return;
    const shape = this._activeStroke.handleEvent(event);
    if (shape) {
      this._dispatch.command(COMMANDS.commitDraw, shape);
      console.log('generated shape: %o', shape);
    }
  }

  _clearStroke(update) {
    console.log('clear active stroke');
    this._activeStroke = null;
  }
}
