import {expect} from 'chai';

import codepage from '../../src/codepage.js';
import {Cell, makeTile} from '../../src/models/cell.js';
import palette from '../../src/palette.js';

describe('Cell', function () {
  describe('#ctor()', function () {
    it('sets defaults if no arguments', function () {
      const result = new Cell();

      expect(result.glyphId).to.equal(codepage.SIGILS.CLEAR);
      expect(result.fgColorId).to.equal(palette.COLORS.BLACK);
      expect(result.bgColorId).to.equal(palette.COLORS.WHITE);
    });

    it('sets nil glyph if given null', function () {
      const result = new Cell(null);

      expect(result.glyphId).to.equal(codepage.SIGILS.CLEAR);
    });

    it('sets NUL glyph if given 0', function () {
      const result = new Cell(0);

      expect(result.glyphId).to.equal(0);
    });

    it('sets properties', function () {
      const result = new Cell(66, 18, 2);

      expect(result.glyphId).to.equal(66);
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
      const result = new Cell(66);

      expect(result.isEmpty()).to.be.false;
    });

    it('is not empty if all properties set', function () {
      const result = new Cell(66, 18, 2);

      expect(result.isEmpty()).to.be.false;
    });
  });

  describe('#equals()', function () {
    it('returns true for itself', function () {
      const target = new Cell();

      expect(target.equals(target)).to.be.true;
    });

    it('returns true for equal cells', function () {
      const cell1 = new Cell(65, 0, 26),
            cell2 = new Cell(65, 0, 26);

      expect(cell1.equals(cell2)).to.be.true;
    });

    it('returns false for different glyphs', function () {
      const cell1 = new Cell(65, 0, 26),
            cell2 = new Cell(66, 0, 26);

      expect(cell1.equals(cell2)).to.be.false;
    });

    it('returns false for different fg colors', function () {
      const cell1 = new Cell(65, 0, 26),
            cell2 = new Cell(65, 15, 26);

      expect(cell1.equals(cell2)).to.be.false;
    });

    it('returns false for different bg colors', function () {
      const cell1 = new Cell(65, 0, 26),
            cell2 = new Cell(65, 0, 23);

      expect(cell1.equals(cell2)).to.be.false;
    });
  });

  describe('#update()', function () {
    beforeEach(function () {
      this.target = new Cell(66, 18, 2);
    });

    it('updates all fields from other cell', function () {
      const other = new Cell(116, 24, 3);

      this.target.update(other);

      expect(this.target.glyphId).to.equal(116);
      expect(this.target.fgColorId).to.equal(24);
      expect(this.target.bgColorId).to.equal(3);
    });

    it('updates single field', function () {
      this.target.update({glyphId: 116});

      expect(this.target.glyphId).to.equal(116);
      expect(this.target.fgColorId).to.equal(18);
      expect(this.target.bgColorId).to.equal(2);
    });

    it('updates multiple fields', function () {
      this.target.update(
        {bgColorId: 3, fgColorId: 24}
      );

      expect(this.target.glyphId).to.equal(66);
      expect(this.target.fgColorId).to.equal(24);
      expect(this.target.bgColorId).to.equal(3);
    });

    it('updates all fields from a literal', function () {
      this.target.update(
        {bgColorId: 3, glyphId: 116, fgColorId: 24}
      );

      expect(this.target.glyphId).to.equal(116);
      expect(this.target.fgColorId).to.equal(24);
      expect(this.target.bgColorId).to.equal(3);
    });

    it('updates all fields directly', function () {
      this.target.bgColorId = 3;
      this.target.glyphId = 116;
      this.target.fgColorId = 24;

      expect(this.target.glyphId).to.equal(116);
      expect(this.target.fgColorId).to.equal(24);
      expect(this.target.bgColorId).to.equal(3);
    });

    it('can set colors to defaults', function () {
      this.target.update({bgColorId: null, fgColorId: null});

      expect(this.target.fgColorId).to.equal(palette.COLORS.BLACK);
      expect(this.target.bgColorId).to.equal(palette.COLORS.WHITE);
    });

    it('can set colors to defaults directly', function () {
      this.target.fgColorId = null;
      this.target.bgColorId = null;

      expect(this.target.fgColorId).to.equal(palette.COLORS.BLACK);
      expect(this.target.bgColorId).to.equal(palette.COLORS.WHITE);
    });

    it('can set glyph to blank', function () {
      this.target.update({glyphId: null});

      expect(this.target.glyphId).to.equal(codepage.SIGILS.CLEAR);
    });

    it('can set glyph to blank directly', function () {
      this.target.glyphId = null;

      expect(this.target.glyphId).to.equal(codepage.SIGILS.CLEAR);
    });
  });

  describe('#clone()', function () {
    beforeEach(function () {
      this.target = new Cell(66, 18, 2);
    });

    it('creates new cell', function () {
      const other = this.target.clone();

      expect(other.glyphId).to.equal(66);
      expect(other.fgColorId).to.equal(18);
      expect(other.bgColorId).to.equal(2);
      expect(other).to.not.equal(this.target);
    });

    it('overrides single field', function () {
      const other = this.target.clone({glyphId: 116});

      expect(other.glyphId).to.equal(116);
      expect(other.fgColorId).to.equal(18);
      expect(other.bgColorId).to.equal(2);
      expect(other).to.not.equal(this.target);
    });

    it('overrides multiple fields', function () {
      const other = this.target.clone({bgColorId: 3, fgColorId: 24});

      expect(other.glyphId).to.equal(66);
      expect(other.fgColorId).to.equal(24);
      expect(other.bgColorId).to.equal(3);
      expect(other).to.not.equal(this.target);
    });

    it('overrides all fields from a literal', function () {
      const other = this.target.clone(
        {bgColorId: 3, glyphId: 116, fgColorId: 24}
      );

      expect(other.glyphId).to.equal(116);
      expect(other.fgColorId).to.equal(24);
      expect(other.bgColorId).to.equal(3);
      expect(other).to.not.equal(this.target);
    });

    it('can set colors to defaults', function () {
      const other = this.target.clone({bgColorId: null, fgColorId: null});

      expect(other.fgColorId).to.equal(palette.COLORS.BLACK);
      expect(other.bgColorId).to.equal(palette.COLORS.WHITE);
    });

    it('can set glyph to blank', function () {
      const other = this.target.clone({glyphId: null});

      expect(other.glyphId).to.equal(codepage.SIGILS.CLEAR);
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
