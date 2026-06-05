import {COMMANDS} from '../commands.js';
import {EVENTS} from '../refresh.js';
import {toolFromShortcut, toolName, toolShortcut, TOOLS} from '../tools.js';
import {keyHandlerMixin, View} from './view.js';

const BUTTON_TOOLS = new Set(['redo', 'undo']);

export class ToolSelector extends View {
  constructor(...args) {
    super(...args);
    this._toolSelector = this.doc.getElementById('tool-selections');
    this._toolSelections = [];
    this._doActions = {};
  }

  draw(initialState) {
    for (const tool of Object.values(TOOLS)) {
      const input = this.doc.createElement('input');
      input.id = `tool-selection-${tool}`;
      input.name = 'tool-selection';
      input.value = tool;
      if (BUTTON_TOOLS.has(tool)) {
        input.type = 'button';
        input.disabled = true;
        input.addEventListener('click', this._applyDoAction.bind(this));
      } else {
        input.type = 'radio';
        input.checked = tool === initialState.toolName;
        input.addEventListener(
          'input', e => this.dispatch.command(COMMANDS.setTool, e.target.value)
        );
      }
      const label = this.doc.createElement('label');
      label.htmlFor = input.id;
      label.title = this._toolTitle(tool);
      label.className = `tool-${tool}`;
      if (BUTTON_TOOLS.has(tool)) {
        label.addEventListener('mousedown', e => {
          if (!e.target.control.disabled) {
            e.target.classList.add('active');
          }
        });
        label.addEventListener('mouseup', e => e.target.classList.remove('active'));
        this._doActions[tool] = input;
      } else {
        this._toolSelections.push(input);
      }
      this._toolSelector.appendChild(input);
      this._toolSelector.appendChild(label);
    }
  }

  subscribe(notifier) {
    notifier.subscribe(EVENTS.onToolChanged, this._refreshTool.bind(this));
    notifier.subscribe(EVENTS.onDrawCommitted, this._refreshDoActions.bind(this));
    notifier.subscribe(EVENTS.onRedo, this._refreshDoActions.bind(this));
    notifier.subscribe(EVENTS.onTerminalCleared, this._refreshDoActions.bind(this));
    notifier.subscribe(EVENTS.onUndo, this._refreshDoActions.bind(this));
    keyHandlerMixin(this, notifier, this._handleKeyboard.bind(this));
  }

  _refreshTool(update) {
    for (const radio of this._toolSelections) {
      radio.checked = radio.value === update.name;
    }
  }

  _applyDoAction(event) {
    const cmd = event.target.value === 'redo' ? COMMANDS.redo : COMMANDS.undo;
    this.dispatch.command(cmd);
  }

  _refreshDoActions(update) {
    this._doActions.undo.disabled = !update.undoOps;
    this._doActions.redo.disabled = !update.redoOps;
  }

  _toolTitle(tool) {
    const name = toolName(tool), shortcut = toolShortcut(tool);
    return `${name} (${shortcut.shift ? 'Shift+' : ''}${shortcut.key.toUpperCase()})`;
  }

  _handleKeyboard(event) {
    if (this.suppressKeyHandler) return;
    const tool = toolFromShortcut(event.key, event.shiftKey);
    if (tool) {
      if (BUTTON_TOOLS.has(tool)) {
        const button = this._doActions[tool];
        if (!button || button.disabled) return;
        this.dispatch.command(COMMANDS[tool]);
      } else {
        this.dispatch.command(COMMANDS.setTool, tool);
      }
    }
  }
}
