import {expect} from 'chai';

import {SIGILS} from '../../src/codepage.js';
import {Cell, makeTile} from '../../src/models/cell.js';
import palette from '../../src/palette.js';

describe('Cell', function () {
  describe('#ctor()', function () {
    it('sets defaults if no arguments', function () {
      const result = new Cell();

      expect(result.glyphId).to.equal(SIGILS.CLEAR);
      expect(result.fgColorId).to.equal(palette.COLORS.black);
      expect(result.bgColorId).to.equal(palette.COLORS.white);
    });

    it('sets nil glyph if given null', function () {
      const result = new Cell(null);

      expect(result.glyphId).to.equal(SIGILS.CLEAR);
    });

    it('sets NUL glyph if given 0', function () {
      const result = new Cell(0x0);

      expect(result.glyphId).to.equal(0x0);
    });

    it('sets properties', function () {
      const result = new Cell(0x42, 18, 2);

      expect(result.glyphId).to.equal(0x42);
      expect(result.fgColorId).to.equal(18);
      expect(result.bgColorId).to.equal(2);
    });
  });

  describe('#isEmpty()', function () {
    it('is empty if default arguments', function () {
      const result = new Cell();

      expect(result.isEmpty()).to.be.true;
    });

    it('is empty if colors but no glyph', function () {
      const result = new Cell(null, 18, 2);

      expect(result.isEmpty()).to.be.true;
    });

    it('is not empty if glyph but no colors', function () {
      const result = new Cell(0x42);

      expect(result.isEmpty()).to.be.false;
    });

    it('is not empty if all properties set', function () {
      const result = new Cell(0x42, 18, 2);

      expect(result.isEmpty()).to.be.false;
    });
  });

  describe('#equals()', function () {
    it('returns true for itself', function () {
      const target = new Cell();

      expect(target.equals(target)).to.be.true;
    });

    it('returns true for equal cells', function () {
      const cell1 = new Cell(0x41, 0, 26),
            cell2 = new Cell(0x41, 0, 26);

      expect(cell1.equals(cell2)).to.be.true;
    });

    it('returns false for different glyphs', function () {
      const cell1 = new Cell(0x41, 0, 26),
            cell2 = new Cell(0x42, 0, 26);

      expect(cell1.equals(cell2)).to.be.false;
    });

    it('returns false for different fg colors', function () {
      const cell1 = new Cell(0x41, 0, 26),
            cell2 = new Cell(0x41, 15, 26);

      expect(cell1.equals(cell2)).to.be.false;
    });

    it('returns false for different bg colors', function () {
      const cell1 = new Cell(0x41, 0, 26),
            cell2 = new Cell(0x41, 0, 23);

      expect(cell1.equals(cell2)).to.be.false;
    });
  });

  describe('#update()', function () {
    beforeEach(function () {
      this.target = new Cell(0x42, 18, 2);
    });

    it('does nothing if no arguments', function () {
      this.target.update();

      expect(this.target.glyphId).to.equal(0x42);
      expect(this.target.fgColorId).to.equal(18);
      expect(this.target.bgColorId).to.equal(2);
    });

    it('updates all fields from other cell', function () {
      const other = new Cell(0x74, 24, 3);

      this.target.update(other);

      expect(this.target.glyphId).to.equal(0x74);
      expect(this.target.fgColorId).to.equal(24);
      expect(this.target.bgColorId).to.equal(3);
    });

    it('updates single field', function () {
      this.target.update({glyphId: 0x74});

      expect(this.target.glyphId).to.equal(0x74);
      expect(this.target.fgColorId).to.equal(18);
      expect(this.target.bgColorId).to.equal(2);
    });

    it('updates multiple fields', function () {
      this.target.update(
        {bgColorId: 3, fgColorId: 24}
      );

      expect(this.target.glyphId).to.equal(0x42);
      expect(this.target.fgColorId).to.equal(24);
      expect(this.target.bgColorId).to.equal(3);
    });

    it('updates all fields from a literal', function () {
      this.target.update(
        {bgColorId: 3, glyphId: 0x74, fgColorId: 24}
      );

      expect(this.target.glyphId).to.equal(0x74);
      expect(this.target.fgColorId).to.equal(24);
      expect(this.target.bgColorId).to.equal(3);
    });

    it('updates all fields directly', function () {
      this.target.bgColorId = 3;
      this.target.glyphId = 0x74;
      this.target.fgColorId = 24;

      expect(this.target.glyphId).to.equal(0x74);
      expect(this.target.fgColorId).to.equal(24);
      expect(this.target.bgColorId).to.equal(3);
    });

    it('can set colors to defaults', function () {
      this.target.update({bgColorId: null, fgColorId: null});

      expect(this.target.bgColorId).to.equal(palette.COLORS.white);
      expect(this.target.fgColorId).to.equal(palette.COLORS.black);
    });

    it('can set colors to defaults directly', function () {
      this.target.bgColorId = null;
      this.target.fgColorId = null;

      expect(this.target.bgColorId).to.equal(palette.COLORS.white);
      expect(this.target.fgColorId).to.equal(palette.COLORS.black);
    });

    it('can set glyph to blank', function () {
      this.target.update({glyphId: null});

      expect(this.target.glyphId).to.equal(SIGILS.CLEAR);
    });

    it('can set glyph to blank directly', function () {
      this.target.glyphId = null;

      expect(this.target.glyphId).to.equal(SIGILS.CLEAR);
    });
  });
});

describe('#makeTile()', function () {
  it('makes a tile', function () {
    const cell = new Cell();

    const result = makeTile(10, 20, cell);

    expect(result.x).to.equal(10);
    expect(result.y).to.equal(20);
    expect(result.cell).to.equal(cell);
  });
});
