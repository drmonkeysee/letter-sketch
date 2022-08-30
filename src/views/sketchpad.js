import codepage from '../codepage.js';
import {COMMANDS} from '../commands.js';
import palette from '../palette.js';
import {version} from '../../package.json';
import {EVENTS} from '../refresh.js';
import {View} from './view.js';

class Controls extends View {
  constructor(...args) {
    super(...args);
    this._form = this.doc.getElementById('sketchpad-controls');
    this._button = this._form.querySelector('button');
    this._inputControls = [
      this.doc.getElementById('font-size'),
      this.doc.getElementById('column-count'),
      this.doc.getElementById('row-count'),
    ];
  }

  get fontSize() { return parseInt(this._inputControls[0].value, 10); }
  get columns() { return parseInt(this._inputControls[1].value, 10); }
  get rows() { return parseInt(this._inputControls[2].value, 10); }

  draw(initialState) {
    const versionLabel = this.doc.getElementById('version');
    versionLabel.textContent = `v${version}`;

    const termSize = initialState.terminal.dimensions;
    [initialState.fontSize, termSize.width, termSize.height]
      .forEach((v, i) => {
        const control = this._inputControls[i];
        control.dataset.currentValue = control.value = v;
      });

    for (const control of this._inputControls) {
      control.addEventListener('input', this._updateButton.bind(this));
    }
    this._form.addEventListener(
      'submit', this._updateSketchpadDims.bind(this)
    );
  }

  subscribe(notifier) {
    notifier.subscribe(
      EVENTS.onTerminalResizeVerify, this._verifyResize.bind(this)
    );
    notifier.subscribe(
      EVENTS.onTerminalResizeReady, this._commitResize.bind(this)
    );
  }

  _updateSketchpadDims(event) {
    event.preventDefault();
    const dimensions = {
      fontSize: this.fontSize,
      columns: this.columns,
      rows: this.rows,
    };
    this.dispatch.command(COMMANDS.checkResizeTerminal, dimensions);
  }

  _verifyResize(update) {
    const confirm = this.doc.defaultView.confirm(
      'Reducing the drawing size may discard portions '
      + 'of your current sketch. Continue?'
    );
    if (confirm) {
      this._commitResize(update);
    } else {
      for (const control of this._inputControls) {
        control.value = control.dataset.currentValue;
      }
      this._updateButton();
    }
  }

  _commitResize(update) {
    for (const control of this._inputControls) {
      control.dataset.currentValue = control.value;
    }
    this._updateButton();
    this.dispatch.command(COMMANDS.commitResizeTerminal, update.dims);
  }

  _updateButton() {
    this._button.disabled = this._inputControls.every(
      c => c.value === c.dataset.currentValue
    );
  }
}

export class SketchPad extends View {
  constructor(...args) {
    super(...args);
    this._controls = new Controls(...args);
    this._ruler = this.doc.getElementById('glyph-ruler');
    this._sketchpad = this.doc.getElementById('sketchpad');
    this._grid = [];
    this._stride = 0;
  }

  draw(initialState) {
    this._controls.draw(initialState);

    this._tool = initialState.tool;

    this._drawSketchpad(initialState.terminal, initialState.fontSize);

    // NOTE: end current gesture if mouseup outside sketchpad
    this.doc.addEventListener('mouseup', this._handleGesture.bind(this));
    this.doc.addEventListener('keydown', this._handleGesture.bind(this));
  }

  subscribe(notifier) {
    this._controls.subscribe(notifier);
    notifier.subscribe(EVENTS.onDrawCommitted, this._committed.bind(this));
    notifier.subscribe(EVENTS.onToolChanged, this._updateTool.bind(this));
    notifier.subscribe(
      EVENTS.onTerminalResized, this._resizeSketchpad.bind(this)
    );
  }

  updateAt(x, y, cell) {
    const gridIdx = x + (y * this._stride),
          gridCell = this._grid[gridIdx];
    if (!gridCell) {
      console.warn('Invalid grid index %d: (%d, %d)', gridIdx, x, y);
      return;
    }
    const gridText = gridCell.firstChild;
    gridText.textContent = codepage.glyph(cell.glyphId);
    gridText.style.color = palette.cssColor(cell.fgColorId);
    gridText.style.backgroundColor = palette.cssColor(cell.bgColorId);
  }

  commitCellSampling(cell) {
    this.dispatch.command(COMMANDS.setForegroundColor, cell.fgColorId);
    this.dispatch.command(COMMANDS.setBackgroundColor, cell.bgColorId);
    this.dispatch.command(COMMANDS.setGlyph, cell.glyphId);
  }

  _drawSketchpad(terminal, fontSize) {
    const tileSize = this._measureGlyph(fontSize),
          termSize = terminal.dimensions;
    this._stride = termSize.width;
    console.log('Tilesize: %o', tileSize);
    console.log('TermSize: %o', termSize);
    const style = this._sketchpad.style;
    style.fontSize = `${fontSize}px`;
    style.width = `${termSize.width * tileSize.width}px`;
    style.height = `${termSize.height * tileSize.height}px`;
    style.gridTemplateColumns = `repeat(${termSize.width}, 1fr)`;

    const cellWidth = `${tileSize.width}px`,
          cellHeight = `${tileSize.height}px`,
          strokeEvents = ['mousedown', 'mouseover', 'mouseup'];

    this._grid.length = 0;
    while (this._sketchpad.firstChild) {
      this._sketchpad.removeChild(this._sketchpad.firstChild);
    }

    for (let y = 0; y < termSize.height; ++y) {
      for (let x = 0; x < termSize.width; ++x) {
        const gridCell = this.doc.createElement('div');
        gridCell.appendChild(this.doc.createElement('span'));

        gridCell.style.width = cellWidth;
        gridCell.style.height = cellHeight;
        gridCell.dataset.x = x;
        gridCell.dataset.y = y;

        for (const e of strokeEvents) {
          gridCell.addEventListener(e, this._handleGesture.bind(this));
        }

        this._grid.push(gridCell);
        this._sketchpad.appendChild(gridCell);
        this.updateAt(x, y, terminal.getCell(x, y));
      }
    }
  }

  _measureGlyph(fontSize) {
    this._ruler.style.fontSize = `${fontSize}px`;
    let dims = {
      minWidth: 100, maxWidth: 0, minHeight: 100, maxHeight: 0
    };
    dims = [...codepage.glyphs()].reduce((acc, letter) => {
      this._ruler.textContent = letter;
      const {width, height} = this._ruler.getBoundingClientRect();
      // NOTE: || operators guard against glyphs with dimensions of 0
      return {
        minWidth: Math.min(acc.minWidth, width || acc.minWidth),
        maxWidth: Math.max(acc.maxWidth, width),
        minHeight: Math.min(acc.minHeight, height || acc.minHeight),
        maxHeight: Math.max(acc.maxHeight, height),
      };
    }, dims);
    this._ruler.textContent = codepage.glyph(codepage.SIGILS.DEFAULT);
    const {width, height} = this._ruler.getBoundingClientRect();
    console.log('Font dims: %o', dims);
    console.log('Bounding rect: %o', {width, height});
    // NOTE: round to the nearest pixel to close rounding gaps
    return {width: Math.round(width), height: Math.round(height)};
  }

  _handleGesture(event) {
    const figure = this._tool.forward(this, event);
    if (figure) {
      this.dispatch.command(COMMANDS.commitDraw, figure);
      console.log('generated figure: %o', figure);
    }
  }

  _committed(update) {
    // NOTE: a cleanup update came from the previously selected tool and has
    // already been committed.
    if (!update.cleanup) {
      console.log('commit figure');
      this._tool.committed(update);
    }
  }

  _updateTool(update) {
    // NOTE: capture any incomplete figure and commit before switching tools
    const figure = this._tool.cleanup();
    if (figure) {
      this.dispatch.command(COMMANDS.commitDraw, figure, true);
      console.log('got cleanup figure: %o', figure);
    }
    this._tool = update.tool;
  }

  _resizeSketchpad(update) {
    this._drawSketchpad(update.terminal, update.fontSize);
  }
}
