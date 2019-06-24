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
              {x: 3, y: 4, cell: new Cell('V', '#ffff00', '#000000')}
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
});
