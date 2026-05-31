import {expect} from 'chai';
import sinon from 'sinon';
import codepage from '../src/codepage.js';
import {Cell} from '../src/models/cell.js';
import {Terminal} from '../src/models/terminal.js';
import {CursorGesture, MouseGesture, SampleCell} from '../src/gestures.js';

function makeMouseEvent(x, y, overrides = {}) {
  return {
    type: 'mousedown',
    target: {dataset: {x: String(x), y: String(y)}},
    preventDefault: sinon.fake(),
    stopPropagation: sinon.fake(),
    ...overrides,
  };
}

function makeKeyEvent(key, overrides = {}) {
  return {
    type: 'keydown',
    key,
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    preventDefault: sinon.fake(),
    stopPropagation: sinon.fake(),
    ...overrides,
  };
}

describe('gestures', function () {
  describe('MouseGesture', function () {
    beforeEach(function () {
      this._terminal = new Terminal(5, 5);
      this._sketchpad = {updateAt: sinon.fake()};
      this._cell = new Cell(codepage.id('A'));
      this._figure = [{x: 2, y: 3, cell: this._cell}];
      this._updateFigure = sinon.fake.returns(this._figure);
      this._target = new MouseGesture(
        this._updateFigure, this._sketchpad, this._terminal
      );
    });
    afterEach(function () {
      sinon.restore();
    });

    describe('#handleEvent()', function () {
      it('routes event type to handler', function () {
        const event = makeMouseEvent(2, 3);

        this._target.handleEvent(event);

        sinon.assert.calledOnce(this._updateFigure);
      });

      it('returns null for unhandled event type', function () {
        const event = makeMouseEvent(2, 3, {type: 'click'});

        const result = this._target.handleEvent(event);

        expect(result).to.be.null;
        sinon.assert.notCalled(this._updateFigure);
      });
    });

    describe('#onMousedown()', function () {
      it('returns null', function () {
        const result = this._target.onMousedown(makeMouseEvent(2, 3));

        expect(result).to.be.null;
      });

      it('calls updateFigure with start point', function () {
        this._target.onMousedown(makeMouseEvent(2, 3));

        sinon.assert.calledWith(
          this._updateFigure, {x: 2, y: 3}, {x: 2, y: 3}
        );
      });

      it('draws figure tiles on sketchpad', function () {
        this._target.onMousedown(makeMouseEvent(2, 3));

        sinon.assert.calledWith(this._sketchpad.updateAt, 2, 3, this._cell);
      });
    });

    describe('#onMouseover()', function () {
      it('returns null when not started', function () {
        const result = this._target.onMouseover(
          makeMouseEvent(2, 3, {type: 'mouseover'})
        );

        expect(result).to.be.null;
        sinon.assert.notCalled(this._updateFigure);
      });

      it('returns null when started', function () {
        this._target.onMousedown(makeMouseEvent(1, 1));

        const result = this._target.onMouseover(
          makeMouseEvent(2, 3, {type: 'mouseover'})
        );

        expect(result).to.be.null;
      });

      it('updates figure with new end point when started', function () {
        this._target.onMousedown(makeMouseEvent(1, 1));

        this._target.onMouseover(makeMouseEvent(2, 3, {type: 'mouseover'}));

        sinon.assert.calledWith(
          this._updateFigure, {x: 1, y: 1}, {x: 2, y: 3}
        );
      });

      it('restores previous frame tiles not in new frame', function () {
        const cell1 = new Cell(codepage.id('A')),
              cell2 = new Cell(codepage.id('B')),
              figure1 = [{x: 1, y: 1, cell: cell1}],
              figure2 = [{x: 2, y: 2, cell: cell2}];
        this._updateFigure = sinon.stub();
        this._updateFigure.onFirstCall().returns(figure1);
        this._updateFigure.onSecondCall().returns(figure2);
        this._target = new MouseGesture(
          this._updateFigure, this._sketchpad, this._terminal
        );

        this._target.onMousedown(makeMouseEvent(1, 1));
        this._target.onMouseover(makeMouseEvent(2, 2, {type: 'mouseover'}));

        sinon.assert.calledWith(this._sketchpad.updateAt, 2, 2, cell2);
        sinon.assert.calledWith(
          this._sketchpad.updateAt, 1, 1, this._terminal.getCell(1, 1)
        );
      });
    });

    describe('#onMouseup()', function () {
      it('returns active figure', function () {
        this._target.onMousedown(makeMouseEvent(1, 1));

        const result = this._target.onMouseup(
          makeMouseEvent(2, 3, {type: 'mouseup'})
        );

        expect(result).to.equal(this._figure);
      });
    });
  });

  describe('CursorGesture', function () {
    beforeEach(function () {
      this._clock = sinon.useFakeTimers();
      this._terminal = new Terminal(5, 5);
      this._sketchpad = {updateAt: sinon.fake()};
      this._figure = {
        cursorOn: new Cell(codepage.SIGILS.CURSOR),
        cursorOff: new Cell(codepage.SIGILS.TRANSPARENT),
        advance: sinon.fake(),
        newline: sinon.fake(),
        reverse: sinon.fake.returns(undefined),
        [Symbol.iterator]: function* () {},
      };
      this._updateFigure = sinon.fake.returns(this._figure);
      this._target = new CursorGesture(
        this._updateFigure, this._sketchpad, this._terminal
      );
    });
    afterEach(function () {
      this._clock.restore();
      sinon.restore();
    });

    describe('#onMousedown()', function () {
      it('returns null on first click', function () {
        const result = this._target.onMousedown(makeMouseEvent(2, 3));

        expect(result).to.be.null;
      });

      it('initializes figure on first click', function () {
        this._target.onMousedown(makeMouseEvent(2, 3));

        sinon.assert.calledOnce(this._updateFigure);
      });

      it('returns figure on second click', function () {
        this._target.onMousedown(makeMouseEvent(2, 3));

        const result = this._target.onMousedown(makeMouseEvent(2, 3));

        expect(result).to.equal(this._figure);
      });

      it('does not re-initialize figure on second click', function () {
        this._target.onMousedown(makeMouseEvent(2, 3));

        this._target.onMousedown(makeMouseEvent(2, 3));

        sinon.assert.calledOnce(this._updateFigure);
      });
    });

    describe('#onKeydown()', function () {
      it('returns null before cursor is placed', function () {
        const result = this._target.onKeydown(makeKeyEvent('a'));

        expect(result).to.be.null;
        sinon.assert.notCalled(this._figure.advance);
      });

      it('returns null for alt key combo', function () {
        this._target.onMousedown(makeMouseEvent(2, 3));

        const result = this._target.onKeydown(makeKeyEvent('a', {altKey: true}));

        expect(result).to.be.null;
        sinon.assert.notCalled(this._figure.advance);
      });

      it('returns null for ctrl key combo', function () {
        this._target.onMousedown(makeMouseEvent(2, 3));

        const result = this._target.onKeydown(makeKeyEvent('a', {ctrlKey: true}));

        expect(result).to.be.null;
        sinon.assert.notCalled(this._figure.advance);
      });

      it('returns null for meta key combo', function () {
        this._target.onMousedown(makeMouseEvent(2, 3));

        const result = this._target.onKeydown(makeKeyEvent('a', {metaKey: true}));

        expect(result).to.be.null;
        sinon.assert.notCalled(this._figure.advance);
      });

      it('calls preventDefault for handled keys', function () {
        this._target.onMousedown(makeMouseEvent(2, 3));
        const event = makeKeyEvent('a');

        this._target.onKeydown(event);

        sinon.assert.calledOnce(event.preventDefault);
      });

      it('advances figure for printable character', function () {
        this._target.onMousedown(makeMouseEvent(2, 3));

        this._target.onKeydown(makeKeyEvent('A'));

        sinon.assert.calledWith(
          this._figure.advance, {x: 2, y: 3}, codepage.id('A')
        );
      });

      it('ignores character not in codepage', function () {
        this._target.onMousedown(makeMouseEvent(2, 3));
        sinon.stub(codepage, 'id').returns(-1);

        this._target.onKeydown(makeKeyEvent('a'));

        sinon.assert.notCalled(this._figure.advance);
      });

      it('advances with transparent glyph for space', function () {
        this._target.onMousedown(makeMouseEvent(2, 3));

        this._target.onKeydown(makeKeyEvent(' '));

        sinon.assert.calledWith(
          this._figure.advance, {x: 2, y: 3}, codepage.SIGILS.TRANSPARENT
        );
      });

      it('returns null and calls reverse for Backspace', function () {
        this._target.onMousedown(makeMouseEvent(2, 3));

        const result = this._target.onKeydown(makeKeyEvent('Backspace'));

        expect(result).to.be.null;
        sinon.assert.calledOnce(this._figure.reverse);
      });

      it('resets cursor to reversed tile position', function () {
        this._figure.reverse = sinon.fake.returns(
          {x: 1, y: 2, cell: new Cell(codepage.id('A'))}
        );
        this._target.onMousedown(makeMouseEvent(2, 3));

        this._target.onKeydown(makeKeyEvent('Backspace'));
        this._target.onKeydown(makeKeyEvent('B'));

        sinon.assert.calledWith(
          this._figure.advance, {x: 1, y: 2}, codepage.id('B')
        );
      });

      it('returns null and records newline for Enter', function () {
        this._target.onMousedown(makeMouseEvent(2, 3));

        const result = this._target.onKeydown(makeKeyEvent('Enter'));

        expect(result).to.be.null;
        sinon.assert.calledWith(this._figure.newline, {x: 2, y: 3});
      });

      it('moves cursor to start of next row for Enter', function () {
        this._target.onMousedown(makeMouseEvent(2, 3));

        this._target.onKeydown(makeKeyEvent('Enter'));
        this._target.onKeydown(makeKeyEvent('A'));

        sinon.assert.calledWith(
          this._figure.advance, {x: 2, y: 4}, codepage.id('A')
        );
      });

      it('returns figure for Escape', function () {
        this._target.onMousedown(makeMouseEvent(2, 3));

        const result = this._target.onKeydown(makeKeyEvent('Escape'));

        expect(result).to.equal(this._figure);
      });

      it('advances cursor to next column after character', function () {
        this._target.onMousedown(makeMouseEvent(2, 3));

        this._target.onKeydown(makeKeyEvent('A'));
        this._target.onKeydown(makeKeyEvent('B'));

        sinon.assert.calledWith(
          this._figure.advance, {x: 3, y: 3}, codepage.id('B')
        );
      });

      it('wraps cursor to start of next row at end of line', function () {
        this._target.onMousedown(makeMouseEvent(4, 2));

        this._target.onKeydown(makeKeyEvent('A'));
        this._target.onKeydown(makeKeyEvent('B'));

        sinon.assert.calledWith(
          this._figure.advance, {x: 0, y: 3}, codepage.id('B')
        );
      });

      it('does not advance past last row', function () {
        this._target.onMousedown(makeMouseEvent(4, 4));

        this._target.onKeydown(makeKeyEvent('A'));
        this._target.onKeydown(makeKeyEvent('B'));

        sinon.assert.calledOnce(this._figure.advance);
      });
    });

    describe('#cleanup()', function () {
      it('returns null before cursor is placed', function () {
        const result = this._target.cleanup();

        expect(result).to.be.null;
      });

      it('returns figure after cursor is placed', function () {
        this._target.onMousedown(makeMouseEvent(2, 3));

        const result = this._target.cleanup();

        expect(result).to.equal(this._figure);
      });

      it('restores sketchpad cell at cursor position', function () {
        this._target.onMousedown(makeMouseEvent(2, 3));
        const terminalCell = this._terminal.getCell(2, 3);

        this._target.cleanup();

        sinon.assert.calledWith(this._sketchpad.updateAt, 2, 3, terminalCell);
      });
    });
  });

  describe('SampleCell', function () {
    beforeEach(function () {
      this._terminal = new Terminal(5, 5);
      this._sketchpad = {
        updateAt: sinon.fake(),
        commitCellSampling: sinon.fake(),
      };
      this._updateFigure = sinon.fake.returns('testFigure');
      this._target = new SampleCell(
        this._updateFigure, this._sketchpad, this._terminal
      );
    });
    afterEach(function () {
      sinon.restore();
    });

    describe('#onMouseup()', function () {
      it('calls stopPropagation', function () {
        const event = makeMouseEvent(2, 3, {type: 'mouseup'});

        this._target.onMouseup(event);

        sinon.assert.calledOnce(event.stopPropagation);
      });

      it('samples cell from terminal at event point', function () {
        const event = makeMouseEvent(2, 3, {type: 'mouseup'}),
              expectedCell = this._terminal.getCell(2, 3);

        this._target.onMouseup(event);

        sinon.assert.calledWith(this._sketchpad.commitCellSampling, expectedCell);
      });

      it('skips sampling for invalid point', function () {
        const event = {
          type: 'mouseup',
          target: {dataset: {x: 'invalid', y: 'invalid'}},
          stopPropagation: sinon.fake(),
        };

        this._target.onMouseup(event);

        sinon.assert.notCalled(this._sketchpad.commitCellSampling);
      });

      it('returns updateFigure result', function () {
        const event = makeMouseEvent(2, 3, {type: 'mouseup'});

        const result = this._target.onMouseup(event);

        expect(result).to.equal('testFigure');
      });
    });
  });
});
