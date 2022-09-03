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
  }

  get fontSize() { return parseInt(this._inputControls[0].value, 10); }
  get columns() { return parseInt(this._inputControls[1].value, 10); }
  get rows() { return parseInt(this._inputControls[2].value, 10); }

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
