import codepage from '../codepage.js';
import {COMMANDS} from '../commands.js';
import {EVENTS} from '../refresh.js';
import {View} from './view.js';

export class PadControls extends View {
  constructor(...args) {
    super(...args);
    this._form = this.doc.getElementById('sketchpad-controls');
    this._button = this._form.querySelector('button');
    this._inputControls = [
      this.doc.getElementById('font-size'),
      this.doc.getElementById('column-count'),
      this.doc.getElementById('row-count'),
    ];
    this._clearButton = this.doc.getElementById('clear-sketch');
    this._suppressKeyHandler = false;
  }

  get fontSize() { return parseInt(this.fontControl.value, 10); }
  get columns() { return parseInt(this._inputControls[1].value, 10); }
  get rows() { return parseInt(this._inputControls[2].value, 10); }

  get fontMax() { return parseInt(this.fontControl.max, 10); }
  get fontMin() { return parseInt(this.fontControl.min, 10); }
  get fontControl() { return this._inputControls[0]; }

  draw(initialState) {
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
    this._clearButton.addEventListener('click', this._clearSketch.bind(this));
    this.doc.addEventListener('keyup', this._handleKeyboard.bind(this));
  }

  subscribe(notifier) {
    notifier.subscribe(
      EVENTS.onTerminalResizeVerify, this._verifyResize.bind(this)
    );
    notifier.subscribe(
      EVENTS.onTerminalResizeReady, this._commitResize.bind(this)
    );
    notifier.subscribe(EVENTS.onTextCursorActive, () => this._suppressKeyHandler = true);
    notifier.subscribe(EVENTS.onDrawCommitted, () => this._suppressKeyHandler = false);
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

  _clearSketch() {
    const confirm = this.doc.defaultView.confirm(
      'Clearing the current sketch cannot be undone. Continue?'
    );
    if (confirm) {
      this.dispatch.command(COMMANDS.clearTerminal, codepage.SIGILS.CLEAR);
    }
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

  _handleKeyboard(event) {
    if (this._suppressKeyHandler) return;
    switch (event.key) {
    case '-':
      this._updateFontSize(Math.max(this.fontMin, this.fontSize - 1), event);
      break;
    case '=':   // +
      this._updateFontSize(Math.min(this.fontSize + 1, this.fontMax), event);
      break;
    case '0':
      this._updateFontSize(codepage.FONT_SIZE, event);
      break;
    case 'n':
      this._clearSketch(event);
      break;
    }
  }

  _updateFontSize(size, event) {
    this.fontControl.value = size;
    this._updateSketchpadDims(event);
  }
}
