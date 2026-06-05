import {expect} from 'chai';
import sinon from 'sinon';

import {CommandDispatcher, COMMANDS} from '../src/commands.js';
import {EVENTS} from '../src/refresh.js';
import * as toolModule from '../src/tools.js';

describe('CommandDispatcher', function () {
  describe('#command()', function () {
    beforeEach(function () {
      this.command = sinon.fake.returns('testNotification');
      this.bindCmd = sinon.fake.returns(this.command);
      this.notifier = {signal: sinon.fake()};
      const models = 'testModels';
      this.target = new CommandDispatcher(this.notifier, models);
      this.target._commands.testCmd = (...args) => this.bindCmd(
        models, ...args
      );
    });

    afterEach(function () {
      sinon.restore();
    });

    it('invokes command and signals result', function () {
      this.target.command('testCmd');

      sinon.assert.calledWith(this.bindCmd, 'testModels');
      sinon.assert.calledWith(this.command);
      sinon.assert.calledWith(this.notifier.signal, 'testNotification');
    });

    it('invokes command with arguments', function () {
      this.target.command('testCmd', 1, 2, 3);

      sinon.assert.calledWith(this.bindCmd, 'testModels', 1, 2, 3);
      sinon.assert.calledWith(this.command);
      sinon.assert.calledWith(this.notifier.signal, 'testNotification');
    });

    it('raises error if invalid command', function () {
      expect(() => this.target.command('notACommand'))
                    .to.throw('Unknown command: notACommand');
    });
  });
});

describe('commands', function () {
  function getBinder(name, models) {
    const d = new CommandDispatcher('fakeNotifier', models);
    return d._commands[name];
  }

  describe('#setForegroundColor()', function () {
    beforeEach(function () {
      this.models = {
        lettertype: {
          cell: {},
        },
      };
      this.target = getBinder(COMMANDS.setForegroundColor, this.models);
    });

    it('sets the foreground color', function () {
      const color = 22,
            cmd = this.target(color);

      const result = cmd();

      expect(this.models.lettertype.cell.fgColorId).to.equal(color);
      expect(result).to.eql(
        {event: EVENTS.onForegroundColorChanged, colorId: color}
      );
    });
  });

  describe('#setBackgroundColor()', function () {
    beforeEach(function () {
      this.models = {
        lettertype: {
          cell: {},
        },
      };
      this.target = getBinder(COMMANDS.setBackgroundColor, this.models);
    });

    it('sets the background color', function () {
      const color = 22,
            cmd = this.target(color);

      const result = cmd();

      expect(this.models.lettertype.cell.bgColorId).to.equal(color);
      expect(result).to.eql(
        {event: EVENTS.onBackgroundColorChanged, colorId: color}
      );
    });
  });

  describe('#setGlyph()', function () {
    beforeEach(function () {
      this.models = {
        lettertype: {
          cell: {},
        },
      };
      this.target = getBinder(COMMANDS.setGlyph, this.models);
    });

    it('sets the cell glyph', function () {
      const glyph = 85,
            cmd = this.target(glyph);

      const result = cmd();

      expect(this.models.lettertype.cell.glyphId).to.equal(glyph);
      expect(result).to.eql({event: EVENTS.onGlyphChanged, glyphId: glyph});
    });
  });

  describe('#setTool()', function () {
    beforeEach(function () {
      this.models = {};
      this.currTool = sinon.stub(toolModule, 'currentTool')
                        .returns('testToolResult');
      this.target = getBinder(COMMANDS.setTool, this.models);
    });

    afterEach(function () {
      sinon.restore();
    });

    it('sets the current tool', function () {
      const tool = 'testTool',
            cmd = this.target(tool);

      const result = cmd();

      sinon.assert.calledWith(this.currTool, this.models);
      expect(this.models.currentTool).to.equal(tool);
      expect(result).to.eql(
        {event: EVENTS.onToolChanged, tool: 'testToolResult', name: 'testTool'}
      );
    });
  });

  describe('#commitDraw()', function () {
    beforeEach(function () {
      this.models = {
        redo: [],
        undo: [],
        terminal: {
          update: sinon.fake.returns('testUndo'),
        },
      };
      this.target = getBinder(COMMANDS.commitDraw, this.models);
    });

    afterEach(function () {
      sinon.restore();
    });

    it('updates the terminal', function () {
      const figure = 'testFigure',
            cmd = this.target(figure);

      const result = cmd();

      sinon.assert.calledWith(this.models.terminal.update, figure);
      expect(result).to.eql(
        {event: EVENTS.onDrawCommitted, cleanup: false, redoOps: false, undoOps: true}
      );
    });

    it('updates the terminal with cleanup flag', function () {
      const figure = 'testFigure',
            cmd = this.target(figure, true);

      const result = cmd();

      sinon.assert.calledWith(this.models.terminal.update, figure);
      expect(result).to.eql(
        {event: EVENTS.onDrawCommitted, cleanup: true, redoOps: false, undoOps: true}
      );
    });

    it('pushes undo figure onto undo stack', function () {
      const cmd = this.target('testFigure');

      cmd();

      expect(this.models.undo).to.eql(['testUndo']);
    });

    it('clears redo stack', function () {
      this.models.redo.push('testRedo');

      const cmd = this.target('testFigure');
      cmd();

      expect(this.models.redo).to.be.empty;
    });
  });

  describe('#undo()', function () {
    beforeEach(function () {
      this.models = {
        redo: [],
        undo: [],
        terminal: {
          update: sinon.fake.returns('testRedo'),
        },
      };
      this.target = getBinder(COMMANDS.undo, this.models);
    });

    afterEach(function () {
      sinon.restore();
    });

    it('returns undefined if undo stack is empty', function () {
      const result = this.target()();

      expect(result).to.be.undefined;
    });

    it('applies undo figure to terminal', function () {
      this.models.undo.push('testUndo');

      this.target()();

      sinon.assert.calledWith(this.models.terminal.update, 'testUndo');
    });

    it('pops undo figure from stack', function () {
      this.models.undo.push('testUndo');

      this.target()();

      expect(this.models.undo).to.be.empty;
    });

    it('pushes redo figure onto redo stack', function () {
      this.models.undo.push('testUndo');

      this.target()();

      expect(this.models.redo).to.eql(['testRedo']);
    });

    it('signals with remaining undo ops', function () {
      this.models.undo.push('testUndo1', 'testUndo2');

      const result = this.target()();

      expect(result).to.eql({
        event: EVENTS.onUndo,
        redoOps: true,
        terminal: this.models.terminal,
        undoOps: true,
      });
    });

    it('signals empty undo stack after last undo', function () {
      this.models.undo.push('testUndo');

      const result = this.target()();

      expect(result).to.eql({
        event: EVENTS.onUndo,
        redoOps: true,
        terminal: this.models.terminal,
        undoOps: false,
      });
    });
  });

  describe('#redo()', function () {
    beforeEach(function () {
      this.models = {
        redo: [],
        undo: [],
        terminal: {
          update: sinon.fake.returns('testUndo'),
        },
      };
      this.target = getBinder(COMMANDS.redo, this.models);
    });

    afterEach(function () {
      sinon.restore();
    });

    it('returns undefined if redo stack is empty', function () {
      const result = this.target()();

      expect(result).to.be.undefined;
    });

    it('applies redo figure to terminal', function () {
      this.models.redo.push('testRedo');

      this.target()();

      sinon.assert.calledWith(this.models.terminal.update, 'testRedo');
    });

    it('pops redo figure from stack', function () {
      this.models.redo.push('testRedo');

      this.target()();

      expect(this.models.redo).to.be.empty;
    });

    it('pushes undo figure onto undo stack', function () {
      this.models.redo.push('testRedo');

      this.target()();

      expect(this.models.undo).to.eql(['testUndo']);
    });

    it('signals with remaining redo ops', function () {
      this.models.redo.push('testRedo1', 'testRedo2');

      const result = this.target()();

      expect(result).to.eql({
        event: EVENTS.onRedo,
        redoOps: true,
        terminal: this.models.terminal,
        undoOps: true,
      });
    });

    it('signals empty redo stack after last redo', function () {
      this.models.redo.push('testRedo');

      const result = this.target()();

      expect(result).to.eql({
        event: EVENTS.onRedo,
        redoOps: false,
        terminal: this.models.terminal,
        undoOps: true,
      });
    });
  });

  describe('#checkResizeTerminal()', function () {
    beforeEach(function () {
      this.models = {
        terminal: {
          dimensions: {height: 20, width: 20},
        },
      };
      this.target = getBinder(COMMANDS.checkResizeTerminal, this.models);
    });

    it('signals ready commit', function () {
      const dims = {columns: 30, rows: 40},
            cmd = this.target(dims);

      const result = cmd();

      expect(result).to.eql({event: EVENTS.onTerminalResizeReady, dims: dims});
    });

    it('signals verify if columns lower than current value', function () {
      const dims = {columns: 10, rows: 40},
            cmd = this.target(dims);

      const result = cmd();

      expect(result).to.eql(
        {event: EVENTS.onTerminalResizeVerify, dims: dims}
      );
    });

    it('signals verify if rows lower than current value', function () {
      const dims = {columns: 30, rows: 5},
            cmd = this.target(dims);

      const result = cmd();

      expect(result).to.eql(
        {event: EVENTS.onTerminalResizeVerify, dims: dims}
      );
    });
  });

  describe('#clearTerminal()', function () {
    beforeEach(function () {
      this.models = {
        redo: [],
        undo: [],
        lettertype: {fontSize: 15},
        terminal: {
          clear: sinon.fake(),
        },
      };
      this.target = getBinder(COMMANDS.clearTerminal, this.models);
    });

    afterEach(function () {
      sinon.restore();
    });

    it('clears the terminal', function () {
      const glyphId = 42,
            cmd = this.target(glyphId);

      const result = cmd();

      sinon.assert.calledWith(this.models.terminal.clear, glyphId);
      expect(result).to.eql({
        event: EVENTS.onTerminalCleared,
        terminal: this.models.terminal,
        fontSize: this.models.lettertype.fontSize,
        redoOps: false,
        undoOps: false,
      });
    });

    it('clears undo and redo stacks', function () {
      this.models.undo.push('testUndo');
      this.models.redo.push('testRedo');

      const cmd = this.target(42);
      cmd();

      expect(this.models.undo).to.be.empty;
      expect(this.models.redo).to.be.empty;
    });
  });

  describe('#commitResizeTerminal()', function () {
    beforeEach(function () {
      this.models = {
        lettertype: {fontSize: 15},
        terminal: {
          resize: sinon.fake(),
        },
      };
      this.target = getBinder(COMMANDS.commitResizeTerminal, this.models);
    });

    afterEach(function () {
      sinon.restore();
    });

    it('updates the model', function () {
      const dims = {fontSize: 20, columns: 10, rows: 8},
            cmd = this.target(dims);

      const result = cmd();

      expect(this.models.lettertype.fontSize).to.equal(20);
      expect(result).to.eql({
        event: EVENTS.onTerminalResized,
        terminal: this.models.terminal,
        fontSize: dims.fontSize
      });
      sinon.assert.calledWith(this.models.terminal.resize, 10, 8)
    });
  });
});
