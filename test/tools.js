import {expect} from 'chai';
import sinon from 'sinon';
import codepage from '../src/codepage.js';
import {Cell} from '../src/models/cell.js';
import {Terminal} from '../src/models/terminal.js';
import {
  TOOLS, currentTool, isBoxTool, isEraser, isTextTool, toolName,
} from '../src/tools.js';

function makeMouseEvent(x, y, overrides = {}) {
  return {
    type: 'mousedown',
    target: {dataset: {x: String(x), y: String(y)}},
    preventDefault: sinon.fake(),
    stopPropagation: sinon.fake(),
    ...overrides,
  };
}

describe('tools', function () {
  describe('Tool', function () {
    beforeEach(function () {
      this._terminal = new Terminal(5, 5);
      this._models = {
        currentTool: 'point',
        lettertype: {cell: new Cell(codepage.id('A'))},
        terminal: this._terminal,
      };
      this._sketchpad = {updateAt: sinon.fake()};
      this._target = currentTool(this._models);
    });

    afterEach(function () {
      sinon.restore();
    });

    describe('#forward()', function () {
      it('returns null for in-progress gesture', function () {
        const result = this._target.forward(
          this._sketchpad, makeMouseEvent(2, 3)
        );

        expect(result).to.be.null;
      });

      it('returns figure when gesture completes', function () {
        this._target.forward(this._sketchpad, makeMouseEvent(2, 3));

        const result = this._target.forward(
          this._sketchpad, makeMouseEvent(2, 3, {type: 'mouseup'})
        );

        expect(result).to.not.be.null;
      });

      it('passes current lettertype cell to figure', function () {
        this._target.forward(this._sketchpad, makeMouseEvent(2, 3));

        sinon.assert.calledWith(
          this._sketchpad.updateAt, 2, 3, this._models.lettertype.cell
        );
      });

      it('reuses gesture to track drag state', function () {
        const models = {
          currentTool: 'brush',
          lettertype: {cell: new Cell(codepage.id('A'))},
          terminal: this._terminal,
        };
        const target = currentTool(models);

        target.forward(this._sketchpad, makeMouseEvent(1, 1));
        target.forward(this._sketchpad, makeMouseEvent(2, 2, {type: 'mouseover'}));

        sinon.assert.calledWith(
          this._sketchpad.updateAt, 2, 2, models.lettertype.cell
        );
      });
    });

    describe('#committed()', function () {
      it('clears gesture so next forward creates a fresh one', function () {
        this._target.forward(this._sketchpad, makeMouseEvent(1, 1));
        const figure = this._target.forward(
          this._sketchpad, makeMouseEvent(1, 1, {type: 'mouseup'})
        );

        this._target.committed(figure);
        const result = this._target.forward(
          this._sketchpad, makeMouseEvent(2, 2)
        );

        expect(result).to.be.null;
        sinon.assert.calledWith(
          this._sketchpad.updateAt, 2, 2, this._models.lettertype.cell
        );
      });
    });

    describe('#cleanup()', function () {
      it('returns null', function () {
        const result = this._target.cleanup();

        expect(result).to.be.null;
      });

      it('clears gesture so next forward creates a fresh one', function () {
        this._target.forward(this._sketchpad, makeMouseEvent(1, 1));

        this._target.cleanup();
        const result = this._target.forward(
          this._sketchpad, makeMouseEvent(2, 2)
        );

        expect(result).to.be.null;
        sinon.assert.calledWith(
          this._sketchpad.updateAt, 2, 2, this._models.lettertype.cell
        );
      });
    });
  });

  describe('TextTool', function () {
    beforeEach(function () {
      this._clock = sinon.useFakeTimers();
      this._terminal = new Terminal(5, 5);
      this._models = {
        currentTool: 'text',
        lettertype: {cell: new Cell(codepage.id('A'))},
        terminal: this._terminal,
      };
      this._sketchpad = {updateAt: sinon.fake()};
      this._target = currentTool(this._models);
    });

    afterEach(function () {
      this._clock.restore();
      sinon.restore();
    });

    describe('#forward()', function () {
      it('returns null while cursor is active', function () {
        const result = this._target.forward(
          this._sketchpad, makeMouseEvent(2, 3)
        );

        expect(result).to.be.null;
      });

      it('returns figure when cursor is committed', function () {
        this._target.forward(this._sketchpad, makeMouseEvent(2, 3));

        const result = this._target.forward(
          this._sketchpad, makeMouseEvent(2, 3)
        );

        expect(result).to.not.be.null;
      });

      it('starts pending gesture on commit', function () {
        this._target.forward(this._sketchpad, makeMouseEvent(2, 3));
        this._target.forward(this._sketchpad, makeMouseEvent(2, 3));

        // committed promotes pending gesture, which already has cursor placed
        this._target.committed({});
        const result = this._target.forward(
          this._sketchpad, makeMouseEvent(2, 3)
        );

        expect(result).to.not.be.null;
      });
    });

    describe('#cleanup()', function () {
      it('returns figure from active cursor gesture', function () {
        this._target.forward(this._sketchpad, makeMouseEvent(2, 3));

        const result = this._target.cleanup();

        expect(result).to.not.be.null;
      });

      it('clears gesture so next forward starts fresh', function () {
        this._target.forward(this._sketchpad, makeMouseEvent(2, 3));

        this._target.cleanup();
        const result = this._target.forward(
          this._sketchpad, makeMouseEvent(2, 3)
        );

        expect(result).to.be.null;
      });
    });
  });

  describe('#currentTool()', function () {
    it('throws for unknown tool', function () {
      expect(() => currentTool({currentTool: 'notATool'}))
        .to.throw('Unknown tool: notATool');
    });
  });

  describe('#toolName()', function () {
    it('returns display name for tool key', function () {
      expect(toolName('point')).to.equal('Single Cell');
      expect(toolName('brush')).to.equal('Free Draw');
      expect(toolName('text')).to.equal('Text');
    });
  });

  describe('#isBoxTool()', function () {
    it('returns true for box tools', function () {
      expect(isBoxTool('boxBrush')).to.be.true;
      expect(isBoxTool('boxRect')).to.be.true;
    });

    it('returns false for non-box tools', function () {
      expect(isBoxTool('brush')).to.be.false;
      expect(isBoxTool('rect')).to.be.false;
    });
  });

  describe('#isEraser()', function () {
    it('returns true for eraser', function () {
      expect(isEraser('eraser')).to.be.true;
    });

    it('returns false for other tools', function () {
      expect(isEraser('brush')).to.be.false;
    });
  });

  describe('#isTextTool()', function () {
    it('returns true for text tool', function () {
      expect(isTextTool('text')).to.be.true;
    });

    it('returns false for other tools', function () {
      expect(isTextTool('brush')).to.be.false;
    });
  });

  describe('TOOLS', function () {
    it('contains all expected tool keys', function () {
      const expected = [
        'point', 'brush', 'boxBrush', 'eraser', 'rect', 'fillRect',
        'boxRect', 'line', 'ellipse', 'fillEllipse', 'text', 'swap',
        'eyedrop', 'fill', 'undo', 'redo',
      ];
      for (const key of expected) {
        expect(TOOLS).to.have.property(key, key);
      }
    });
  });
});
