import namemap from './namemap.js';
import {EVENTS} from './refresh.js';
import {currentTool} from './tools.js';

function makeUpdate(event, data) {
  return {event, ...data};
}

const COMMAND_REGISTRY = {
  commitDraw(models, figure, cleanup = false) {
    return () => {
      models.terminal.update(figure);
      return makeUpdate(EVENTS.onDrawCommitted, {figure, cleanup});
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
  setBackgroundColor(models, colorId) {
    return () => {
      models.lettertype.cell.bgColorId = colorId;
      return makeUpdate(EVENTS.onBackgroundColorChanged, {colorId});
    };
  },
  setForegroundColor(models, colorId) {
    return () => {
      models.lettertype.cell.fgColorId = colorId;
      return makeUpdate(EVENTS.onForegroundColorChanged, {colorId});
    };
  },
  setGlyph(models, glyphId) {
    return () => {
      models.lettertype.cell.glyphId = glyphId;
      return makeUpdate(EVENTS.onGlyphChanged, {glyphId});
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
};

export const COMMANDS = namemap(
  Object.values(COMMAND_REGISTRY), (name, c) => name
);

export class CommandDispatcher {
  constructor(notifier, models) {
    this.notifier = notifier;
    this._bindCommands(models);
  }

  command(name, ...args) {
    const boundCmd = this._commands[name];
    if (!boundCmd) throw new Error(`Unknown command: ${name}`);
    const cmd = boundCmd(...args),
          update = cmd();
    this.notifier.signal(update);
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
