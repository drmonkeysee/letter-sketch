import {expect} from 'chai';

import codepage from '../../src/codepage.js';
import {Cell} from '../../src/models/cell.js';
import {Terminal} from '../../src/models/terminal.js';
import palette from '../../src/palette.js';

describe('Terminal', function () {
  describe('#ctor()', function () {
    it('creates smallest allowed terminal', function () {
      const target = new Terminal(1, 1);

      expect(target.dimensions).to.eql({width: 1, height: 1});
      const testCell = target.getCell(0, 0);
      expect(testCell.glyphId).to.equal(codepage.SIGILS.CLEAR);
      expect(testCell.fgColorId).to.equal(palette.COLORS.BLACK);
      expect(testCell.bgColorId).to.equal(palette.COLORS.WHITE);
    });

    it('creates terminal', function () {
      const target = new Terminal(20, 10);

      expect(target.dimensions).to.eql({width: 20, height: 10});
      const testCell = target.getCell(10, 5);
      expect(testCell.glyphId).to.equal(codepage.SIGILS.CLEAR);
      expect(testCell.fgColorId).to.equal(palette.COLORS.BLACK);
      expect(testCell.bgColorId).to.equal(palette.COLORS.WHITE);
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
            newCell = new Cell(0x42, 16, 20),
            targetCell = target.getCell(5, 2);

      target.updateCell(5, 2, newCell);

      const updatedCell = target.getCell(5, 2);
      expect(updatedCell).to.equal(targetCell);
      expect(updatedCell).to.not.equal(newCell);
      expect(updatedCell.glyphId).to.equal(0x42);
      expect(updatedCell.fgColorId).to.equal(16);
      expect(updatedCell.bgColorId).to.equal(20);
      expect(updatedCell.glyphId).to.equal(newCell.glyphId);
      expect(updatedCell.fgColorId).to.equal(newCell.fgColorId);
      expect(updatedCell.bgColorId).to.equal(newCell.bgColorId);
    });
  });

  describe('#update()', function () {
    it('updates all cells in figure', function () {
      const target = new Terminal(5, 5),
            figure = [
              {x: 3, y: 2, cell: new Cell(
                codepage.id('^'), palette.id('#ff0000'), palette.id('#000000')
              )},
              {x: 2, y: 3, cell: new Cell(
                codepage.id('<'), palette.id('#00ff00'), palette.id('#000000')
              )},
              {x: 4, y: 3, cell: new Cell(
                codepage.id('>'), palette.id('#0000ff'), palette.id('#000000')
              )},
              {x: 3, y: 4, cell: new Cell(
                codepage.id('V'), palette.id('#ffff00'), palette.id('#000000')
              )},
            ];

      target.update(figure);

      const topCell = target.getCell(3, 2);
      expect(topCell.glyphId).to.equal(codepage.id('^'));
      expect(topCell.fgColorId).to.equal(palette.id('#ff0000'));
      expect(topCell.bgColorId).to.equal(palette.id('#000000'));
      const leftCell = target.getCell(2, 3);
      expect(leftCell.glyphId).to.equal(codepage.id('<'));
      expect(leftCell.fgColorId).to.equal(palette.id('#00ff00'));
      expect(leftCell.bgColorId).to.equal(palette.id('#000000'));
      const rightCell = target.getCell(4, 3);
      expect(rightCell.glyphId).to.equal(codepage.id('>'));
      expect(rightCell.fgColorId).to.equal(palette.id('#0000ff'));
      expect(rightCell.bgColorId).to.equal(palette.id('#000000'));
      const bottomCell = target.getCell(3, 4);
      expect(bottomCell.glyphId).to.equal(codepage.id('V'));
      expect(bottomCell.fgColorId).to.equal(palette.id('#ffff00'));
      expect(bottomCell.bgColorId).to.equal(palette.id('#000000'));
      const middleCell = target.getCell(3, 3);
      expect(middleCell.glyphId).to.equal(codepage.SIGILS.CLEAR);
      expect(middleCell.fgColorId).to.equal(palette.COLORS.BLACK);
      expect(middleCell.bgColorId).to.equal(palette.COLORS.WHITE);
    });
  });

  describe('#resize()', function () {
    function filledCellCount(terminal) {
      const {width, height} = terminal.dimensions;
      let filledCellCount = 0;
      for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
          const cell = terminal.getCell(x, y);
          if (!cell.isEmpty()) {
            ++filledCellCount;
          }
        }
      }
      return filledCellCount;
    }

    before(function () {
      this.initTerminal = function (cols, rows, testFigure) {
        this.target = new Terminal(cols, rows);
        this.originalFigure = [];
        for (const [x, y, glyph] of testFigure) {
          this.target.updateCell(x, y, new Cell(codepage.id(glyph)));
          this.originalFigure.push(this.target.getCell(x, y));
        }
      };

      this.assertFigureTransform = function (adjustedFigure) {
        let adjustedLength = 0;
        adjustedFigure.forEach((c, i) =>  {
          if (!c) return;
          ++adjustedLength;
          const [x, y] = c,
                targetCell = this.target.getCell(x, y),
                originalCell = this.originalFigure[i];
          expect(targetCell).to.equal(
            originalCell,
            `new cell (${x}, ${y}) did not match original cell at index ${i}`
          );
        });
        expect(filledCellCount(this.target)).to.equal(
          adjustedLength,
          'filled cell count does not match expected figure length'
        );
      };
    });

    describe('for odd-sized terminal', function () {
      beforeEach(function () {
        const testFigure = [
          [0, 0, 'N'],
          [4, 0, 'E'],
          [2, 2, 'A'],
          [0, 4, 'W'],
          [4, 4, 'S'],
        ];
        this.initTerminal(5, 5, testFigure);
      });

      it('does nothing if resize matches current size', function () {
        this.target.resize(5, 5);

        expect(this.target.getCell(0, 0)).to.equal(this.originalFigure[0]);
      });

      it('grows terminal by 1x1', function () {
        this.target.resize(6, 6);

        const expectedFigure = [
          [0, 0],
          [4, 0],
          [2, 2],
          [0, 4],
          [4, 4],
        ];
        this.assertFigureTransform(expectedFigure);
      });

      it('grows terminal by 2x2', function () {
        this.target.resize(7, 7);

        const expectedFigure = [
          [1, 1],
          [5, 1],
          [3, 3],
          [1, 5],
          [5, 5],
        ];
        this.assertFigureTransform(expectedFigure);
      });

      it('shrinks terminal by 1x1', function () {
        this.target.resize(4, 4);

        const expectedFigure = [
          [0, 0],
          null,
          [2, 2],
          null,
          null,
        ];
        this.assertFigureTransform(expectedFigure);
      });

      it('shrinks terminal by 2x2', function () {
        this.target.resize(3, 3);

        const expectedFigure = [
          null,
          null,
          [1, 1],
          null,
          null,
        ];
        this.assertFigureTransform(expectedFigure);
      });

      it('shrinks terminal to one cell', function () {
        this.target.resize(1, 1);

        const expectedFigure = [
          null,
          null,
          [0, 0],
          null,
          null,
        ];
        this.assertFigureTransform(expectedFigure);
      });
    });

    describe('for even-sized terminal', function () {
      beforeEach(function () {
        const testFigure = [
          [0, 0, 'N'],
          [5, 0, 'E'],
          [2, 2, 'A'],
          [3, 2, 'B'],
          [2, 3, 'C'],
          [3, 3, 'D'],
          [0, 5, 'W'],
          [5, 5, 'S'],
        ];
        this.initTerminal(6, 6, testFigure);
      });

      it('does nothing if resize matches current size', function () {
        this.target.resize(6, 6);

        expect(this.target.getCell(0, 0)).to.equal(this.originalFigure[0]);
      });

      it('grows terminal by 1x1', function () {
        this.target.resize(7, 7);

        const expectedFigure = [
          [0, 0],
          [5, 0],
          [2, 2],
          [3, 2],
          [2, 3],
          [3, 3],
          [0, 5],
          [5, 5],
        ];
        this.assertFigureTransform(expectedFigure);
      });

      it('grows terminal by 2x2', function () {
        this.target.resize(8, 8);

        const expectedFigure = [
          [1, 1],
          [6, 1],
          [3, 3],
          [4, 3],
          [3, 4],
          [4, 4],
          [1, 6],
          [6, 6],
        ];
        this.assertFigureTransform(expectedFigure);
      });

      it('shrinks terminal by 1x1', function () {
        this.target.resize(5, 5);

        const expectedFigure = [
          [0, 0],
          null,
          [2, 2],
          [3, 2],
          [2, 3],
          [3, 3],
          null,
          null,
        ];
        this.assertFigureTransform(expectedFigure);
      });

      it('shrinks terminal by 2x2', function () {
        this.target.resize(4, 4);

        const expectedFigure = [
          null,
          null,
          [1, 1],
          [2, 1],
          [1, 2],
          [2, 2],
          null,
          null,
        ];
        this.assertFigureTransform(expectedFigure);
      });

      it('shrinks terminal to one cell', function () {
        this.target.resize(1, 1);

        const expectedFigure = [
          null,
          null,
          [0, 0],
          null,
          null,
          null,
          null,
          null,
        ];
        this.assertFigureTransform(expectedFigure);
      });
    });
  });
});
