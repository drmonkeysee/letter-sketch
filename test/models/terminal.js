import {expect} from 'chai';

import {Cell} from '../../src/models/cell.js';
import {Terminal} from '../../src/models/terminal.js';

describe('Terminal', function () {
  describe('#ctor()', function () {
    it('creates smallest allowed terminal', function () {
      const target = new Terminal(1, 1);

      expect(target.dimensions).to.eql({width: 1, height: 1});
      const testCell = target.getCell(0, 0);
      expect(testCell.glyph).to.equal('\u0020');
      expect(testCell.foregroundColor).to.not.exist;
      expect(testCell.backgroundColor).to.not.exist;
    });

    it('creates terminal', function () {
      const target = new Terminal(20, 10);

      expect(target.dimensions).to.eql({width: 20, height: 10});
      const testCell = target.getCell(10, 5);
      expect(testCell.glyph).to.equal('\u0020');
      expect(testCell.foregroundColor).to.not.exist;
      expect(testCell.backgroundColor).to.not.exist;
    });

    it('throws if less than min', function () {
      const ctorCall = () => new Terminal(0, 0);

      expect(ctorCall).to.throw(/\{columns: 0, rows: 0\}/);
    });

    it('throws if greater than max', function () {
      const ctorCall = () => new Terminal(65537, 65537);

      expect(ctorCall).to.throw(/\{columns: 65537, rows: 65537\}/);
    });
  });

  describe('#updateCell()', function () {
    it('updates given cell', function () {
      const target = new Terminal(10, 5),
            newCell = new Cell('A', '#222222', '#232323'),
            targetCell = target.getCell(5, 2);

      target.updateCell(5, 2, newCell);

      const updatedCell = target.getCell(5, 2);
      // expect cell instance to not have been replaced
      expect(updatedCell).to.equal(targetCell);
      expect(updatedCell).to.not.equal(newCell);
      // expect cell to have new values
      expect(updatedCell.glyph).to.equal('A');
      expect(updatedCell.foregroundColor).to.equal('#222222');
      expect(updatedCell.backgroundColor).to.equal('#232323');
      // expect source cell to not have been changed
      expect(updatedCell.glyph).to.equal(newCell.glyph);
      expect(updatedCell.foregroundColor).to.equal(newCell.foregroundColor);
      expect(updatedCell.backgroundColor).to.equal(newCell.backgroundColor);
    });
  });

  describe('#update()', function () {
    it('updates all cells in figure', function () {
      const target = new Terminal(5, 5),
            figure = [
              {x: 3, y: 2, cell: new Cell('^', '#ff0000', '#000000')},
              {x: 2, y: 3, cell: new Cell('<', '#00ff00', '#000000')},
              {x: 4, y: 3, cell: new Cell('>', '#0000ff', '#000000')},
              {x: 3, y: 4, cell: new Cell('V', '#ffff00', '#000000')},
            ];

      target.update(figure);

      const topCell = target.getCell(3, 2);
      expect(topCell.glyph).to.equal('^');
      expect(topCell.foregroundColor).to.equal('#ff0000');
      expect(topCell.backgroundColor).to.equal('#000000');
      const leftCell = target.getCell(2, 3);
      expect(leftCell.glyph).to.equal('<');
      expect(leftCell.foregroundColor).to.equal('#00ff00');
      expect(leftCell.backgroundColor).to.equal('#000000');
      const rightCell = target.getCell(4, 3);
      expect(rightCell.glyph).to.equal('>');
      expect(rightCell.foregroundColor).to.equal('#0000ff');
      expect(rightCell.backgroundColor).to.equal('#000000');
      const bottomCell = target.getCell(3, 4);
      expect(bottomCell.glyph).to.equal('V');
      expect(bottomCell.foregroundColor).to.equal('#ffff00');
      expect(bottomCell.backgroundColor).to.equal('#000000');
      const middleCell = target.getCell(3, 3);
      expect(middleCell.glyph).to.equal('\u0020');
      expect(middleCell.foregroundColor).to.not.exist;
      expect(middleCell.backgroundColor).to.not.exist;
    });
  });

  describe('#resize()', function () {
    before(function () {
      this.assertFigureTransform = function (...coords) {
        coords.forEach((c, i) =>  {
          if (!c) return;
          const [x, y] = c,
                targetCell = this.target.getCell(x, y),
                originalCell = this.originalFigure[i];
          expect(targetCell).to.equal(
            originalCell,
            `new cell (${x}, ${y}) did not match original cell at index ${i}`
          );
        });
      };
    });

    beforeEach(function () {
      this.target = new Terminal(5, 5);
      const testFigure = [
              [0, 0],
              [4, 0],
              [2, 2],
              [0, 4],
              [4, 4],
            ],
            figureCell = new Cell('X');
      this.originalFigure = [];
      for (const [x, y] of testFigure) {
        this.target.updateCell(x, y, figureCell);
        this.originalFigure.push(this.target.getCell(x, y));
      }
    });

    it('does nothing if resize matches current size', function () {
      this.target.resize(5, 5);

      expect(this.target.getCell(0, 0)).to.equal(this.originalFigure[0]);
    });

    it('grows terminal by 1x1', function () {
      this.target.resize(6, 6);

      const expectedFigureAt = [
        [0, 0],
        [4, 0],
        [2, 2],
        [0, 4],
        [4, 4],
      ];
      this.assertFigureTransform(...expectedFigureAt);
    });

    it('grows terminal by 2x2', function () {
      this.target.resize(7, 7);

      const expectedFigureAt = [
        [1, 1],
        [5, 1],
        [3, 3],
        [0, 5],
        [5, 5],
      ];
      this.assertFigureTransform(...expectedFigureAt);
    });

    it('shrinks terminal by 1x1', function () {
      this.target.resize(4, 4);

      const expectedFigureAt = [
        [0, 0],
        null,
        [2, 2],
        null,
        null,
      ];
      this.assertFigureTransform(...expectedFigureAt);
    });

    it('shrinks terminal by 2x2', function () {
      this.target.resize(3, 3);

      const expectedFigureAt = [
        null,
        null,
        [1, 1],
        null,
        null,
      ];
      this.assertFigureTransform(...expectedFigureAt);
    });
  });
});
