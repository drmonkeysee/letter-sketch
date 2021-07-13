import {COMMANDS} from '../commands.js';
import {EVENTS} from '../refresh.js';
import {TOOLS} from '../tools.js';
import {View} from './view.js';

export class ToolSelector extends View {
  constructor(...args) {
    super(...args);
    this._toolSelector = this.doc.getElementById('tool-selections');
    this._toolSelections = [];
    this._lineToggle = this.doc.getElementById('line-mode');
  }

  draw(initialState) {
    for (const tool of Object.values(TOOLS)) {
      const radio = this.doc.createElement('input');
      radio.type = 'radio';
      radio.id = `tool-selection-${tool}`;
      radio.name = 'tool-selection';
      radio.value = tool;
      radio.checked = tool === initialState.toolName;
      radio.addEventListener('input', this._pickTool.bind(this));
      const label = this.doc.createElement('label');
      label.htmlFor = radio.id;
      label.innerText = tool;
      this._toolSelector.appendChild(radio);
      this._toolSelector.appendChild(label);
      this._toolSelections.push(radio);
    }

    this._lineToggle.checked = initialState.lineMode;
    this._lineToggle.addEventListener('input',
                                      this._toggleLineMode.bind(this));
  }

  subscribe(notifier) {
    notifier.subscribe(EVENTS.onToolChanged, this._refreshTool.bind(this));
    notifier.subscribe(EVENTS.onLineModeChanged,
                       this._refreshLineMode.bind(this));
  }

  _pickTool(event) {
    this.dispatch.command(COMMANDS.setTool, event.target.value);
  }

  _refreshTool(update) {
    for (const radio of this._toolSelections) {
      radio.checked = radio.value === update.name;
    }
  }

  _toggleLineMode(event) {
    this.dispatch.command(COMMANDS.setLineMode, event.target.checked);
  }

  _refreshLineMode(update) {
    this._lineToggle.checked = update.value;
  }
}
