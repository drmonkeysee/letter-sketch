import {expect} from 'chai';

import {SIGILS} from '../../src/codepage.js';
import {Cell, makeTile} from '../../src/models/cell.js';

describe('Cell', function () {
  describe('#ctor()', function () {
    it('sets defaults if no arguments', function () {
      const result = new Cell();

      expect(result.glyphId).to.equal(SIGILS.CLEAR);
      expect(result.foregroundColor).to.not.exist;
      expect(result.backgroundColor).to.not.exist;
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
      const result = new Cell(0x42, 'red', 'blue');

      expect(result.glyphId).to.equal(0x42);
      expect(result.foregroundColor).to.equal('red');
      expect(result.backgroundColor).to.equal('blue');
    });
  });

  describe('#isEmpty()', function () {
    it('is empty if default arguments', function () {
      const result = new Cell();

      expect(result.isEmpty()).to.be.true;
    });

    it('is empty if colors but no glyph', function () {
      const result = new Cell(null, 'red', 'blue');

      expect(result.isEmpty()).to.be.true;
    });

    it('is not empty if glyph but no colors', function () {
      const result = new Cell(0x42);

      expect(result.isEmpty()).to.be.false;
    });

    it('is not empty if all properties set', function () {
      const result = new Cell(0x42, 'red', 'blue');

      expect(result.isEmpty()).to.be.false;
    });
  });

  describe('#equals()', function () {
    it('returns true for itself', function () {
      const target = new Cell();

      expect(target.equals(target)).to.be.true;
    });

    it('returns true for equal cells', function () {
      const cell1 = new Cell(0x41, '#000', '#fff'),
            cell2 = new Cell(0x41, '#000', '#fff');

      expect(cell1.equals(cell2)).to.be.true;
    });

    it('returns false for different glyphs', function () {
      const cell1 = new Cell(0x41, '#000', '#fff'),
            cell2 = new Cell(0x42, '#000', '#fff');

      expect(cell1.equals(cell2)).to.be.false;
    });

    it('returns false for different fg colors', function () {
      const cell1 = new Cell(0x41, '#000', '#fff'),
            cell2 = new Cell(0x41, '#555', '#fff');

      expect(cell1.equals(cell2)).to.be.false;
    });

    it('returns false for different bg colors', function () {
      const cell1 = new Cell(0x41, '#000', '#fff'),
            cell2 = new Cell(0x41, '#000', '#999');

      expect(cell1.equals(cell2)).to.be.false;
    });
  });

  describe('#update()', function () {
    beforeEach(function () {
      this.target = new Cell(0x42, 'red', 'blue');
    });

    it('does nothing if no arguments', function () {
      this.target.update();

      expect(this.target.glyphId).to.equal(0x42);
      expect(this.target.foregroundColor).to.equal('red');
      expect(this.target.backgroundColor).to.equal('blue');
    });

    it('updates all fields from other cell', function () {
      const other = new Cell(0x74, 'yellow', 'green');

      this.target.update(other);

      expect(this.target.glyphId).to.equal(0x74);
      expect(this.target.foregroundColor).to.equal('yellow');
      expect(this.target.backgroundColor).to.equal('green');
    });

    it('updates single field', function () {
      this.target.update({glyphId: 0x74});

      expect(this.target.glyphId).to.equal(0x74);
      expect(this.target.foregroundColor).to.equal('red');
      expect(this.target.backgroundColor).to.equal('blue');
    });

    it('updates multiple fields', function () {
      this.target.update(
        {backgroundColor: 'green', foregroundColor: 'yellow'}
      );

      expect(this.target.glyphId).to.equal(0x42);
      expect(this.target.foregroundColor).to.equal('yellow');
      expect(this.target.backgroundColor).to.equal('green');
    });

    it('updates all fields from a literal', function () {
      this.target.update(
        {backgroundColor: 'green', glyphId: 0x74, foregroundColor: 'yellow'}
      );

      expect(this.target.glyphId).to.equal(0x74);
      expect(this.target.foregroundColor).to.equal('yellow');
      expect(this.target.backgroundColor).to.equal('green');
    });

    it('updates all fields directly', function () {
      this.target.backgroundColor = 'green';
      this.target.glyphId = 0x74;
      this.target.foregroundColor = 'yellow';

      expect(this.target.glyphId).to.equal(0x74);
      expect(this.target.foregroundColor).to.equal('yellow');
      expect(this.target.backgroundColor).to.equal('green');
    });

    it('can set fields to null', function () {
      this.target.update({backgroundColor: null, foregroundColor: null});

      expect(this.target.backgroundColor).to.be.null;
      expect(this.target.foregroundColor).to.be.null;
    });

    it('can set fields to null directly', function () {
      this.target.backgroundColor = null;
      this.target.foregroundColor = null;

      expect(this.target.backgroundColor).to.be.null;
      expect(this.target.foregroundColor).to.be.null;
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
