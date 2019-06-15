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
      expect(() => this.target.command('notACommand')).to.throw('Unknown command: notACommand');
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
          cell: {}
        }
      };
      this.target = getBinder(COMMANDS.setForegroundColor, this.models);
    });

    it('sets the foreground color', function () {
      const color = 'testColor',
            cmd = this.target(color);

      const result = cmd();

      expect(this.models.lettertype.cell.foregroundColor).to.equal(color);
      expect(result).to.eql({event: EVENTS.onForegroundColorChanged, color: color});
    });
  });

  describe('#setBackgroundColor()', function () {
    beforeEach(function () {
      this.models = {
        lettertype: {
          cell: {}
        }
      };
      this.target = getBinder(COMMANDS.setBackgroundColor, this.models);
    });

    it('sets the background color', function () {
      const color = 'testColor',
            cmd = this.target(color);

      const result = cmd();

      expect(this.models.lettertype.cell.backgroundColor).to.equal(color);
      expect(result).to.eql({event: EVENTS.onBackgroundColorChanged, color: color});
    });
  });

  describe('#setGlyph()', function () {
    beforeEach(function () {
      this.models = {
        lettertype: {
          cell: {}
        }
      };
      this.target = getBinder(COMMANDS.setGlyph, this.models);
    });

    it('sets the cell glyph', function () {
      const glyph = 'testGlyph',
            cmd = this.target(glyph);

      const result = cmd();

      expect(this.models.lettertype.cell.glyph).to.equal(glyph);
      expect(result).to.eql({event: EVENTS.onGlyphChanged, glyph: glyph});
    });
  });

  describe('#setTool()', function () {
    beforeEach(function () {
      this.models = {};
      this.currTool = sinon.stub(toolModule, 'currentTool').returns('testToolResult');
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
      expect(result).to.eql({event: EVENTS.onToolChanged, tool: 'testToolResult', name: 'testTool'});
    });
  });

  describe('#commitDraw()', function () {
    beforeEach(function () {
      this.models = {
        terminal: {
          update: sinon.fake()
        }
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
      expect(result).to.eql({event: EVENTS.onDrawCommitted, figure: figure});
    });
  });

  describe('#checkResizeTerminal()', function () {
    beforeEach(function () {
      this.models = {
        terminal: {
          dimensions: {height: 20, width: 20}
        }
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

      expect(result).to.eql({event: EVENTS.onTerminalResizeVerify, dims: dims});
    });

    it('signals verify if rows lower than current value', function () {
      const dims = {columns: 30, rows: 5},
            cmd = this.target(dims);

      const result = cmd();

      expect(result).to.eql({event: EVENTS.onTerminalResizeVerify, dims: dims});
    });
  });
});
