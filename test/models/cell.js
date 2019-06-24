import {expect} from 'chai';

import {Cell, makeTile} from '../../src/models/cell.js';

describe('Cell', function () {
  describe('#ctor()', function () {
    it('sets defaults if no arguments', function () {
      const result = new Cell();

      expect(result.glyph).to.equal('\u0020');
      expect(result.foregroundColor).to.not.exist;
      expect(result.backgroundColor).to.not.exist;
    });

    it('sets nil glyph if given null', function () {
      const result = new Cell(null);

      expect(result.glyph).to.equal('\u0020');
    });

    it('sets nil glyph if given empty string', function () {
      const result = new Cell('');

      expect(result.glyph).to.equal('\u0020');
    });

    it('sets properties', function () {
      const result = new Cell('B', 'red', 'blue');

      expect(result.glyph).to.equal('B');
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
      const result = new Cell('B');

      expect(result.isEmpty()).to.be.false;
    });

    it('is not empty if all properties set', function () {
      const result = new Cell('B', 'red', 'blue');

      expect(result.isEmpty()).to.be.false;
    });
  });

  describe('#update()', function () {
    beforeEach(function () {
      this.target = new Cell('B', 'red', 'blue');
    });

    it('does nothing if no arguments', function () {
      this.target.update();

      expect(this.target.glyph).to.equal('B');
      expect(this.target.foregroundColor).to.equal('red');
      expect(this.target.backgroundColor).to.equal('blue');
    });

    it('updates all fields from other cell', function () {
      const other = new Cell('t', 'yellow', 'green');

      this.target.update(other);

      expect(this.target.glyph).to.equal('t');
      expect(this.target.foregroundColor).to.equal('yellow');
      expect(this.target.backgroundColor).to.equal('green');
    });

    it('updates single field', function () {
      this.target.update({glyph: 't'});

      expect(this.target.glyph).to.equal('t');
      expect(this.target.foregroundColor).to.equal('red');
      expect(this.target.backgroundColor).to.equal('blue');
    });

    it('updates multiple fields', function () {
      this.target.update({backgroundColor: 'green', foregroundColor: 'yellow'});

      expect(this.target.glyph).to.equal('B');
      expect(this.target.foregroundColor).to.equal('yellow');
      expect(this.target.backgroundColor).to.equal('green');
    });

    it('updates all fields from a literal', function () {
      this.target.update({backgroundColor: 'green', glyph: 't', foregroundColor: 'yellow'});

      expect(this.target.glyph).to.equal('t');
      expect(this.target.foregroundColor).to.equal('yellow');
      expect(this.target.backgroundColor).to.equal('green');
    });

    it('updates all fields directly', function () {
      this.target.backgroundColor = 'green';
      this.target.glyph = 't';
      this.target.foregroundColor = 'yellow';

      expect(this.target.glyph).to.equal('t');
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
      this.target.update({glyph: null});

      expect(this.target.glyph).to.equal('\u0020');
    });

    it('can set glyph to blank directly', function () {
      this.target.glyph = null;

      expect(this.target.glyph).to.equal('\u0020');
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
