import {expect} from 'chai';
import sinon from 'sinon';

import {CommandDispatcher, COMMANDS} from '../src/commands.js';
import * as nmModule from '../src/namemap.js';
import {EVENTS} from '../src/refresh.js';
import * as toolModule from '../src/tools.js';

describe('CommandDispatcher', function () {
  describe('#command()', function () {
    beforeEach(function () {
      this.command = sinon.fake.returns('testNotification');
      this.bindCmd = sinon.fake.returns(this.command);
      const injectBindCmd = (r, f, n) => ({testCmd: f(n, this.bindCmd)});
      sinon.stub(nmModule, 'default').callsFake(injectBindCmd);
      this.notifier = {signal: sinon.fake()};
      this.target = new CommandDispatcher(this.notifier, 'testModels');
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
      const glyph = 0x55,
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

  describe('#setBoxMode()', function () {
    beforeEach(function () {
      this.models = {boxMode: false};
      this.target = getBinder(COMMANDS.setBoxMode, this.models);
    });

    it('sets the box mode', function () {
      const val = true,
            cmd = this.target(val);

      const result = cmd();

      expect(this.models.boxMode).to.be.true;
      expect(result).to.eql(
        {event: EVENTS.onBoxModeChanged, value: val}
      );
    });
  });

  describe('#commitDraw()', function () {
    beforeEach(function () {
      this.models = {
        terminal: {
          update: sinon.fake(),
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
        {event: EVENTS.onDrawCommitted, figure: figure, cleanup: false}
      );
    });

    it('updates the terminal with cleanup flag', function () {
      const figure = 'testFigure',
            cmd = this.target(figure, true);

      const result = cmd();

      sinon.assert.calledWith(this.models.terminal.update, figure);
      expect(result).to.eql(
        {event: EVENTS.onDrawCommitted, figure: figure, cleanup: true}
      );
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
