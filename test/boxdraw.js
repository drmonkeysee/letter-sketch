import {expect} from 'chai';

import {DIRECTIONS, getLineSet, hasAttractor} from '../src/boxdraw.js';

describe('#hasAttractor', function () {
  it('has attractor', function () {
    const result = hasAttractor(218, DIRECTIONS.RIGHT);

    expect(result).to.be.true;
  });

  it('does not have attractor', function () {
    const result = hasAttractor(218, DIRECTIONS.TOP);

    expect(result).to.be.false;
  });

  it('has no attractor for invalid glyph', function () {
    const result = hasAttractor(41, DIRECTIONS.RIGHT);

    expect(result).to.be.false;
  });
});

describe('#getLineSet', function () {
  it('returns null for non-line glyph', function () {
    const result = getLineSet(41);

    expect(result).to.be.null;
  });

  describe('singleLineSet', function () {
    beforeEach(function ()  {
      this.target = getLineSet(218);
    });

    it('gets best fit for directions', function () {
      const result = this.target.getId(DIRECTIONS.TOP | DIRECTIONS.LEFT);

      expect(result).to.equal(217);
    });

    it('gets best fit for no directions', function () {
      const result = this.target.getId(0);

      expect(result).to.equal(196);
    });

    it('gets best fit for horizontal', function () {
      const result = this.target.getId(DIRECTIONS.RIGHT | DIRECTIONS.LEFT);

      expect(result).to.equal(196);
    });

    it('gets best fit for vertical', function () {
      const result = this.target.getId(DIRECTIONS.TOP | DIRECTIONS.BOTTOM);

      expect(result).to.equal(179);
    });

    it('has attractor', function () {
      const result = this.target.hasAttractor(218, DIRECTIONS.RIGHT);

      expect(result).to.be.true;
    });

    it('does not have attractor', function () {
      const result = this.target.hasAttractor(218, DIRECTIONS.TOP);

      expect(result).to.be.false;
    });

    it('has no attractor for invalid glyph', function () {
      const result = this.target.hasAttractor(41, DIRECTIONS.RIGHT);

      expect(result).to.be.false;
    });
  });
});
