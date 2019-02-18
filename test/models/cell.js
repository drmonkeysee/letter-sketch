import {expect} from 'chai';
import {Cell, makeTile} from '../../src/models/cell.js';

describe('Cell', function () {
  describe('#ctor()', function () {
    it('sets defaults if no arguments', function () {
      const result = new Cell();

      expect(result.glyph).to.equal('\u0000');
      expect(result.foregroundColor).to.be.null;
      expect(result.backgroundColor).to.be.null;
    });

    it('sets nil glyph if given null', function () {
      const result = new Cell(null);

      expect(result.glyph).to.equal('\u0000');
    });

    it('sets nil glyph if given empty string', function () {
      const result = new Cell('');

      expect(result.glyph).to.equal('\u0000');
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
    let target;
    
    beforeEach(function () {
      target = new Cell('B', 'red', 'blue');
    });
    
    it('does nothing if no arguments', function () {
      target.update();

      expect(target.glyph).to.equal('B');
      expect(target.foregroundColor).to.equal('red');
      expect(target.backgroundColor).to.equal('blue');
    });

    it('updates all fields from other cell', function () {
      const other = new Cell('t', 'yellow', 'green');

      target.update(other);

      expect(target.glyph).to.equal('t');
      expect(target.foregroundColor).to.equal('yellow');
      expect(target.backgroundColor).to.equal('green');
    });

    it('updates single field', function () {
      target.update({glyph: 't'});

      expect(target.glyph).to.equal('t');
      expect(target.foregroundColor).to.equal('red');
      expect(target.backgroundColor).to.equal('blue');
    });

    it('updates multiple fields', function () {
      target.update({backgroundColor: 'green', foregroundColor: 'yellow'});

      expect(target.glyph).to.equal('B');
      expect(target.foregroundColor).to.equal('yellow');
      expect(target.backgroundColor).to.equal('green');
    });

    it('updates all fields from a literal', function () {
      target.update({backgroundColor: 'green', glyph: 't', foregroundColor: 'yellow'});

      expect(target.glyph).to.equal('t');
      expect(target.foregroundColor).to.equal('yellow');
      expect(target.backgroundColor).to.equal('green');
    });
  });
});
