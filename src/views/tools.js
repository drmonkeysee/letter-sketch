import {COMMANDS} from '../commands.js';
import {EVENTS} from '../refresh.js';
import {toolName, TOOLS} from '../tools.js';
import {View} from './view.js';

const BUTTON_TOOLS = new Set(['redo', 'undo']);

export class ToolSelector extends View {
  constructor(...args) {
    super(...args);
    this._toolSelector = this.doc.getElementById('tool-selections');
    this._toolSelections = [];
  }

  draw(initialState) {
    for (const tool of Object.values(TOOLS)) {
      const input = this.doc.createElement('input');
      input.id = `tool-selection-${tool}`;
      input.name = 'tool-selection';
      input.value = tool;
      if (BUTTON_TOOLS.has(tool)) {
        input.type = 'button';
        input.addEventListener('click', e => console.log('clicked: %o', e.target.value));
      } else {
        input.type = 'radio';
        input.checked = tool === initialState.toolName;
        input.addEventListener('input', this._pickTool.bind(this));
      }
      const label = this.doc.createElement('label');
      label.htmlFor = input.id;
      label.title = toolName(tool);
      label.className = `tool-${tool}`;
      if (BUTTON_TOOLS.has(tool)) {
        label.addEventListener('mousedown', e => e.target.classList.add('active'))
        label.addEventListener('mouseup', e => e.target.classList.remove('active'))
      } else {
        this._toolSelections.push(input);
      }
      this._toolSelector.appendChild(input);
      this._toolSelector.appendChild(label);
    }
  }

  subscribe(notifier) {
    notifier.subscribe(EVENTS.onToolChanged, this._refreshTool.bind(this));
  }

  _pickTool(event) {
    this.dispatch.command(COMMANDS.setTool, event.target.value);
  }

  _refreshTool(update) {
    for (const radio of this._toolSelections) {
      radio.checked = radio.value === update.name;
    }
  }
}
