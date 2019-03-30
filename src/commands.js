import namemap from './namemap.js';
import {EVENTS} from './refresh.js';
import {currentTool} from './tools.js';

function makeUpdate(event, data) {
  return {event, ...data};
}

function setForegroundColor(models, color) {
  return () => {
    models.lettertype.cell.foregroundColor = color;
    return makeUpdate(EVENTS.onForegroundColorChanged, {color});
  };
}

function setBackgroundColor(models, color) {
  return () => {
    models.lettertype.cell.backgroundColor = color;
    return makeUpdate(EVENTS.onBackgroundColorChanged, {color});
  };
}

function setFillColor(models, color) {
  return () => {
    models.lettertype.fillColor = color;
    return makeUpdate(EVENTS.onFillColorChanged, {color});
  };
}

function setGlyph(models, glyph) {
  return () => {
    models.lettertype.cell.glyph = glyph;
    return makeUpdate(EVENTS.onGlyphChanged, {glyph});
  };
}

function setTool(models, toolName) {
  return () => {
    models.currentTool = toolName;
    return makeUpdate(EVENTS.onToolChanged, {tool: currentTool(models), name: toolName});
  };
}

function commitDraw(models, figure) {
  return () => {
    models.terminal.update(figure);
    return makeUpdate(EVENTS.onDrawCommitted, {figure});
  };
}

const COMMAND_REGISTRY = [
  setForegroundColor,
  setBackgroundColor,
  setFillColor,
  setGlyph,
  setTool,
  commitDraw
];

export const COMMANDS = namemap(COMMAND_REGISTRY, (name, c) => name);

export class CommandDispatcher {
  constructor(notifier, models) {
    this._notifier = notifier;
    this._bindCommands(models);
  }

  command(name, ...args) {
    const boundCmd = this._commands[name];
    if (!boundCmd) throw new Error(`Unknown command: ${name}`);
    const cmd = boundCmd(...args),
          update = cmd();
    this._notifier.signal(update);
  }

  _bindCommands(models) {
    // NOTE: bind models to each command function via currying so only
    // command-specific args are needed when invoked from the view layer.
    this._commands = namemap(
      COMMAND_REGISTRY,
      (n, mkCmd) => (...args) => mkCmd(models, ...args)
    );
  }
}
