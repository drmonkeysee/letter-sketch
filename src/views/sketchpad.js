import {View} from './view.js';
import {COMMANDS} from '../commands.js';
import {EVENTS} from '../refresh.js';

class Controls extends View {
  constructor(...args) {
    super(...args);
    this.rows = this.columns = 0;
    this._letterSizeControl = this._doc.getElementById('letter-size');
    this._columnsControl = this._doc.getElementById('column-count');
    this._rowsControl = this._doc.getElementById('row-count');
    this._resize = this._doc.getElementById('resize-sketchpad');
  }

  draw(initialState) {
    const termSize = initialState.terminal.dimensions;
    this._columnsControl.value = this.columns = termSize.width;
    this._rowsControl.value = this.rows = termSize.height;
  }
}

export class SketchPad extends View {
  constructor(...args) {
    super(...args);
    this._controls = new Controls(...args);
    this._sketchpad = this._doc.getElementById('sketchpad');
    this._grid = [];
  }

  draw(initialState) {
    this._controls.draw(initialState);
    
    this._tool = initialState.tool;
    this._sketchpad.style.width = `${this._controls.columns * initialState.tileSize.width}px`;
    this._sketchpad.style.height = `${this._controls.rows * initialState.tileSize.height}px`;
    this._sketchpad.style.gridTemplateColumns = `repeat(${this._controls.columns}, 1fr)`;
    
    const cellHeight = `${initialState.tileSize.height}px`,
          cellWidth = `${initialState.tileSize.width}px`,
          startEvents = ['mousedown'],
          strokeEvents = ['mouseover', 'mouseup'];
    for (let y = 0; y < this._controls.rows; ++y) {
      for (let x = 0; x < this._controls.columns; ++x) {
        const gridCell = this._doc.createElement('div');
        gridCell.appendChild(this._doc.createElement('span'));

        gridCell.style.height = cellHeight;
        gridCell.style.width = cellWidth;
        gridCell.dataset.x = x;
        gridCell.dataset.y = y;

        for (const e of startEvents) {
          gridCell.addEventListener(e, this._startGesture.bind(this));
        }
        for (const e of strokeEvents) {
          gridCell.addEventListener(e, this._continueGesture.bind(this));
        }

        this._grid.push(gridCell);
        this._sketchpad.appendChild(gridCell);
        this.updateAt(x, y, initialState.terminal.getCell(x, y));
      }
    }

    // NOTE: end current gesture if user action leaves sketchpad
    this._sketchpad.addEventListener('mouseleave', this._terminateGesture.bind(this));
  }

  subscribe(notifier) {
    notifier.subscribe(EVENTS.onDrawCommitted, this._clearGesture.bind(this));
    notifier.subscribe(EVENTS.onToolChanged, this._updateTool.bind(this));
  }

  updateAt(x, y, cell) {
    const gridCell = this._grid[x + (y * this._controls.columns)],
          gridText = gridCell.firstChild;
    gridText.textContent = cell.glyph;
    gridText.style.color = cell.foregroundColor;
    gridText.style.backgroundColor = cell.backgroundColor;
  }

  _startGesture(event) {
    this._activeGesture = this._tool.startGesture(this);
    this._continueGesture(event);
  }

  _continueGesture(event) {
    if (!this._activeGesture) return;
    const figure = this._activeGesture.handleEvent(event);
    if (figure) {
      this._dispatch.command(COMMANDS.commitDraw, figure);
      console.log('generated figure: %o', figure);
    }
  }

  _clearGesture(update) {
    console.log('clear active gesture');
    this._activeGesture = null;
  }

  _terminateGesture(update) {
    if (!this._activeGesture) return;
    const figure = this._activeGesture.currentFigure;
    if (figure) {
      this._dispatch.command(COMMANDS.commitDraw, figure);
      console.log('generated figure on terminate: %o', figure);
    }
  }

  _updateTool(update) {
    this._tool = update.tool;
  }
}
