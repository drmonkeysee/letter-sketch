import {EVENTS} from './refresh.js';
import {currentTool} from './tools.js';

function makeUpdate(event, data) {
  return {event, ...data};
}

const COMMAND_REGISTRY = {
  commitDraw(models, figure, cleanup = false) {
    return () => {
      models.undo.push(models.terminal.update(figure));
      models.redo.length = 0;
      return makeUpdate(EVENTS.onDrawCommitted, {
        cleanup,
        redoOps: models.redo.length > 0,
        undoOps: models.undo.length > 0,
      });
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
      const redo = models.redo.pop();
      if (!redo) return;
      models.undo.push(models.terminal.update(redo));
      return makeUpdate(EVENTS.onRedo, {
        redoOps: models.redo.length > 0,
        terminal: models.terminal,
        undoOps: models.undo.length > 0,
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
  signalTextCursor() {
    return () => {
      return makeUpdate(EVENTS.onTextCursorActive, {});
    };
  },
  undo(models) {
    return () => {
      const undo = models.undo.pop();
      if (!undo) return;
      models.redo.push(models.terminal.update(undo));
      return makeUpdate(EVENTS.onUndo, {
        redoOps: models.redo.length > 0,
        terminal: models.terminal,
        undoOps: models.undo.length > 0,
      });
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
