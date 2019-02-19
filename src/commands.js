import namemap from './namemap.js';
import {EVENTS, makeUpdate} from './refresh.js';
import {currentTool} from './tools.js';

// TODO: rework these classes into closures
class SetForegroundColor {
  constructor(models, color) {
    this._brushCell = models.brush.cell;
    this._color = color;
  }

  execute() {
    this._brushCell.update({foregroundColor: this._color});
    return makeUpdate(EVENTS.onForegroundColorChanged, {color: this._brushCell.foregroundColor});
  }
}

class SetBackgroundColor {
  constructor(models, color) {
    this._brushCell = models.brush.cell;
    this._color = color;
  }

  execute() {
    this._brushCell.update({backgroundColor: this._color});
    return makeUpdate(EVENTS.onBackgroundColorChanged, {color: this._brushCell.backgroundColor});
  }
}

class SetFillColor {
  constructor(models, color) {
    this._brush = models.brush;
    this._color = color;
  }

  execute() {
    this._brush.fillColor = this._color;
    return makeUpdate(EVENTS.onFillColorChanged, {color: this._brush.fillColor});
  }
}

class SetGlyph {
  constructor(models, glyph) {
    this._brushCell = models.brush.cell;
    this._glyph = glyph;
  }

  execute() {
    this._brushCell.update({glyph: this._glyph});
    return makeUpdate(EVENTS.onGlyphChanged, {glyph: this._brushCell.glyph});
  }
}

class SetTool {
  constructor(models, toolName) {
    this._models = models;
    this._toolName = toolName;
  }

  execute() {
    this._models.currentTool = toolName;
    return makeUpdate(EVENTS.onToolChanged, {tool: currentTool(this._models)});
  }
}

class CommitDraw {
  constructor(models, figure) {
    this._terminal = models.terminal;
    this._figure = figure;
  }

  execute() {
    this._terminal.update(this._figure);
    return makeUpdate(EVENTS.onDrawCommitted, {figure: this._figure});
  }
}

const COMMAND_REGISTRY = [
  SetForegroundColor,
  SetBackgroundColor,
  SetFillColor,
  SetGlyph,
  SetTool,
  CommitDraw
];

export const COMMANDS = namemap(COMMAND_REGISTRY, (name, c) => Symbol(name));

export class CommandDispatcher {
  constructor(notifier, models) {
    this._notifier = notifier;
    this._bindCommands(models);
  }

  command(name, ...args) {
    const cmdCls = this._commands[name];
    if (!cmdCls) throw new Error(`Unknown command: ${name.toString()}`);
    const cmd = new cmdCls(...args),
          update = cmd.execute();
    this._notifier.signal(update);
  }

  _bindCommands(models) {
    // NOTE: create cmd factory per class that captures models for command ctor binding
    this._commands = namemap(
      COMMAND_REGISTRY,
      (n, cmdCls) => (...args) => new cmdCls(models, ...args),
      name => COMMANDS[name]
    );
  }
}
