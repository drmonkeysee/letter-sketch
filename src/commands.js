import {EVENTS} from './refresh.js';
import {currentTool} from './tools.js';

function makeUpdate(event, data) {
  return {event, ...data};
}

const COMMAND_REGISTRY = {
  commitDraw(models, figure, cleanup = false) {
    return () => {
      models.terminal.update(figure);
      return makeUpdate(EVENTS.onDrawCommitted, {cleanup});
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
  clearTerminal(models, glyphId) {
    return () => {
      console.log('cleared terminal to glyph: %o', glyphId);
      models.terminal.clear(glyphId);
      return makeUpdate(EVENTS.onTerminalCleared, {
        terminal: models.terminal, fontSize: models.lettertype.fontSize,
      });
    };
  },
  commitResizeTerminal(models, dims) {
    return () => {
      console.log('resized terminal: %o', dims);
      models.terminal.resize(dims.columns, dims.rows);
      models.lettertype.fontSize = dims.fontSize;
      return makeUpdate(EVENTS.onTerminalResized, {
        terminal: models.terminal, fontSize: dims.fontSize,
      });
    };
  },
  redo(models) {
    return () => {
      console.log('REDO');
      return makeUpdate(EVENTS.onRedo, {});
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
  signalTextCursor() {
    return () => {
      return makeUpdate(EVENTS.onTextCursorActive, {});
    };
  },
  undo(models) {
    return () => {
      console.log('UNDO');
      return makeUpdate(EVENTS.onUndo, {});
    };
  },
};

export const COMMANDS = Object.fromEntries(
  Object.keys(COMMAND_REGISTRY).map(k => [k, k])
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
    // Bind models to each command function via currying so only
    // command-specific args are needed when invoked from the view layer.
    this._commands = Object.fromEntries(
      Object.entries(COMMAND_REGISTRY).map(
        ([k, v]) => [k, (...args) => v(models, ...args)]
      )
    );
  }
}
