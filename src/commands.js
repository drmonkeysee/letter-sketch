import namemap from './namemap.js';
import {EVENTS} from './refresh.js';
import {currentTool} from './tools.js';

function makeUpdate(event, data) {
  return {event, ...data};
}

const COMMAND_REGISTRY = {
  setForegroundColor(models, color) {
    return () => {
      models.lettertype.cell.foregroundColor = color;
      return makeUpdate(EVENTS.onForegroundColorChanged, {color});
    };
  },
  setBackgroundColor(models, color) {
    return () => {
      models.lettertype.cell.backgroundColor = color;
      return makeUpdate(EVENTS.onBackgroundColorChanged, {color});
    };
  },
  setGlyph(models, glyph) {
    return () => {
      models.lettertype.cell.glyph = glyph;
      return makeUpdate(EVENTS.onGlyphChanged, {glyph});
    };
  },
  setTool(models, toolName) {
    return () => {
      models.currentTool = toolName;
      return makeUpdate(
        EVENTS.onToolChanged, {tool: currentTool(models), name: toolName}
      );
    };
  },
  commitDraw(models, figure) {
    return () => {
      models.terminal.update(figure);
      return makeUpdate(EVENTS.onDrawCommitted, {figure});
    };
  },
  checkResizeTerminal(models, dims) {
    return () => {
      const terminalSize = models.terminal.dimensions,
            event = dims.columns < terminalSize.width
                        || dims.rows < terminalSize.height
                      ? EVENTS.onTerminalResizeVerify
                      : EVENTS.onTerminalResizeReady;
      return makeUpdate(event, {dims});
    };
  },
  commitResizeTerminal(models, dims) {
    return () => {
      console.log('resized terminal: %o', dims);
      models.terminal.resize(dims.columns, dims.rows);
      models.lettertype.fontSize = dims.fontSize;
      return makeUpdate(EVENTS.onTerminalResized, {
        terminal: models.terminal, fontSize: dims.fontSize
      });
    };
  },
};

export const COMMANDS = namemap(
  Object.values(COMMAND_REGISTRY), (name, c) => name
);

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
      Object.values(COMMAND_REGISTRY),
      (n, mkCmd) => (...args) => mkCmd(models, ...args)
    );
  }
}
