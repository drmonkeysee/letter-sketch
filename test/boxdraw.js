import {expect} from 'chai';

import {
  DIRECTIONS, getLineSet, hasAttractor, interpolateLineSet,
} from '../src/boxdraw.js';

describe('DIRECTIONS', function () {
  describe('#complement()', function () {
    it('flips top to bottom', function () {
      const result = DIRECTIONS.complement(DIRECTIONS.TOP);

      expect(result).to.equal(DIRECTIONS.BOTTOM);
    });

    it('flips bottom to top', function () {
      const result = DIRECTIONS.complement(DIRECTIONS.BOTTOM);

      expect(result).to.equal(DIRECTIONS.TOP);
    });

    it('flips left to right', function () {
      const result = DIRECTIONS.complement(DIRECTIONS.LEFT);

      expect(result).to.equal(DIRECTIONS.RIGHT);
    });

    it('flips right to left', function () {
      const result = DIRECTIONS.complement(DIRECTIONS.RIGHT);

      expect(result).to.equal(DIRECTIONS.LEFT);
    });
  });
});

describe('#hasAttractor()', function () {
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

describe('#getLineSet()', function () {
  it('returns null for non-line glyph', function () {
    const result = getLineSet(41);

    expect(result).to.be.null;
  });

  describe('singleLineSet', function () {
    beforeEach(function ()  {
      this.target = getLineSet(218);
    });

    describe('#getId()', function () {
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
    });

    describe('#hasAttractor()', function () {
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

  describe('doubleLineSet', function () {
    beforeEach(function ()  {
      this.target = getLineSet(201);
    });

    describe('#getId()', function () {
      it('gets best fit for directions', function () {
        const result = this.target.getId(DIRECTIONS.TOP | DIRECTIONS.LEFT);

        expect(result).to.equal(188);
      });

      it('gets best fit for no directions', function () {
        const result = this.target.getId(0);

        expect(result).to.equal(205);
      });

      it('gets best fit for horizontal', function () {
        const result = this.target.getId(DIRECTIONS.RIGHT | DIRECTIONS.LEFT);

        expect(result).to.equal(205);
      });

      it('gets best fit for vertical', function () {
        const result = this.target.getId(DIRECTIONS.TOP | DIRECTIONS.BOTTOM);

        expect(result).to.equal(186);
      });
    });

    describe('#hasAttractor()', function () {
      it('has attractor', function () {
        const result = this.target.hasAttractor(201, DIRECTIONS.RIGHT);

        expect(result).to.be.true;
      });

      it('does not have attractor', function () {
        const result = this.target.hasAttractor(201, DIRECTIONS.TOP);

        expect(result).to.be.false;
      });

      it('has no attractor for invalid glyph', function () {
        const result = this.target.hasAttractor(41, DIRECTIONS.RIGHT);

        expect(result).to.be.false;
      });
    });
  });

  describe('doubleHLineSet', function () {
    beforeEach(function ()  {
      this.target = getLineSet(213);
    });

    describe('#getId()', function () {
      it('gets best fit for directions', function () {
        const result = this.target.getId(DIRECTIONS.TOP | DIRECTIONS.LEFT);

        expect(result).to.equal(190);
      });

      it('gets best fit for no directions', function () {
        const result = this.target.getId(0);

        expect(result).to.equal(205);
      });

      it('gets best fit for horizontal', function () {
        const result = this.target.getId(DIRECTIONS.RIGHT | DIRECTIONS.LEFT);

        expect(result).to.equal(205);
      });

      it('gets best fit for vertical', function () {
        const result = this.target.getId(DIRECTIONS.TOP | DIRECTIONS.BOTTOM);

        expect(result).to.equal(179);
      });
    });

    describe('#hasAttractor()', function () {
      it('has attractor', function () {
        const result = this.target.hasAttractor(213, DIRECTIONS.RIGHT);

        expect(result).to.be.true;
      });

      it('does not have attractor', function () {
        const result = this.target.hasAttractor(213, DIRECTIONS.TOP);

        expect(result).to.be.false;
      });

      it('has no attractor for invalid glyph', function () {
        const result = this.target.hasAttractor(41, DIRECTIONS.RIGHT);

        expect(result).to.be.false;
      });
    });
  });

  describe('doubleVLineSet', function () {
    beforeEach(function ()  {
      this.target = getLineSet(214);
    });

    describe('#getId()', function () {
      it('gets best fit for directions', function () {
        const result = this.target.getId(DIRECTIONS.TOP | DIRECTIONS.LEFT);

        expect(result).to.equal(189);
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

        expect(result).to.equal(186);
      });
    });

    describe('#hasAttractor()', function () {
      it('has attractor', function () {
        const result = this.target.hasAttractor(214, DIRECTIONS.RIGHT);

        expect(result).to.be.true;
      });

      it('does not have attractor', function () {
        const result = this.target.hasAttractor(214, DIRECTIONS.TOP);

        expect(result).to.be.false;
      });

      it('has no attractor for invalid glyph', function () {
        const result = this.target.hasAttractor(41, DIRECTIONS.RIGHT);

        expect(result).to.be.false;
      });
    });
  });
});

describe('#interpolateLineSet()', function () {
  it('interpolates null for non-line glyph', function () {
    const ls = getLineSet(218);

    const result = interpolateLineSet(ls, DIRECTIONS.RIGHT, 41);

    expect(result).to.be.null;
  });

  it('returns same line set if both single line', function () {
    const ls = getLineSet(218);

    const result = interpolateLineSet(ls, DIRECTIONS.BOTTOM, 179);

    expect(result).to.equal(ls);
  });

  it('returns same line set if both double line', function () {
    const ls = getLineSet(205);

    const result = interpolateLineSet(ls, DIRECTIONS.BOTTOM, 186);

    expect(result).to.equal(ls);
  });

  describe('single attractor', function () {
    it('horizontal to double', function () {
      const ls = getLineSet(218);

      const result = interpolateLineSet(ls, DIRECTIONS.RIGHT, 205);

      const expected = getLineSet(214);
      expect(result).to.equal(expected);
    });

    it('vertical to double', function () {
      const ls = getLineSet(218);

      const result = interpolateLineSet(ls, DIRECTIONS.BOTTOM, 205);

      const expected = getLineSet(213);
      expect(result).to.equal(expected);
    });

    it('horizontal to doubleH', function () {
      const ls = getLineSet(218);

      const result = interpolateLineSet(ls, DIRECTIONS.RIGHT, 181);

      const expected = getLineSet(218);
      expect(result).to.equal(expected);
    });

    it('vertical to doubleH', function () {
      const ls = getLineSet(218);

      const result = interpolateLineSet(ls, DIRECTIONS.BOTTOM, 181);

      const expected = getLineSet(213);
      expect(result).to.equal(expected);
    });

    it('horizontal to doubleV', function () {
      const ls = getLineSet(218);

      const result = interpolateLineSet(ls, DIRECTIONS.RIGHT, 182);

      const expected = getLineSet(214);
      expect(result).to.equal(expected);
    });

    it('vertical to doubleV', function () {
      const ls = getLineSet(218);

      const result = interpolateLineSet(ls, DIRECTIONS.BOTTOM, 182);

      const expected = getLineSet(218);
      expect(result).to.equal(expected);
    });
  });

  describe('double attractor', function () {
    it('horizontal to single', function () {
      const ls = getLineSet(201);

      const result = interpolateLineSet(ls, DIRECTIONS.RIGHT, 196);

      const expected = getLineSet(213);
      expect(result).to.equal(expected);
    });

    it('vertical to single', function () {
      const ls = getLineSet(201);

      const result = interpolateLineSet(ls, DIRECTIONS.BOTTOM, 196);

      const expected = getLineSet(214);
      expect(result).to.equal(expected);
    });

    it('horizontal to doubleH', function () {
      const ls = getLineSet(201);

      const result = interpolateLineSet(ls, DIRECTIONS.RIGHT, 181);

      const expected = getLineSet(213);
      expect(result).to.equal(expected);
    });

    it('vertical to doubleH', function () {
      const ls = getLineSet(201);

      const result = interpolateLineSet(ls, DIRECTIONS.BOTTOM, 181);

      const expected = getLineSet(201);
      expect(result).to.equal(expected);
    });

    it('horizontal to doubleV', function () {
      const ls = getLineSet(201);

      const result = interpolateLineSet(ls, DIRECTIONS.RIGHT, 182);

      const expected = getLineSet(201);
      expect(result).to.equal(expected);
    });

    it('vertical to doubleV', function () {
      const ls = getLineSet(201);

      const result = interpolateLineSet(ls, DIRECTIONS.BOTTOM, 182);

      const expected = getLineSet(214);
      expect(result).to.equal(expected);
    });
  });

  describe('doubleH attractor', function () {
    it('horizontal to single', function () {
      const ls = getLineSet(213);

      const result = interpolateLineSet(ls, DIRECTIONS.RIGHT, 196);

      const expected = getLineSet(213);
      expect(result).to.equal(expected);
    });

    it('vertical to single', function () {
      const ls = getLineSet(213);

      const result = interpolateLineSet(ls, DIRECTIONS.BOTTOM, 196);

      const expected = getLineSet(218);
      expect(result).to.equal(expected);
    });

    it('horizontal to double', function () {
      const ls = getLineSet(213);

      const result = interpolateLineSet(ls, DIRECTIONS.RIGHT, 205);

      const expected = getLineSet(201);
      expect(result).to.equal(expected);
    });

    it('vertical to double', function () {
      const ls = getLineSet(213);

      const result = interpolateLineSet(ls, DIRECTIONS.BOTTOM, 205);

      const expected = getLineSet(213);
      expect(result).to.equal(expected);
    });

    it('horizontal to doubleV', function () {
      const ls = getLineSet(213);

      const result = interpolateLineSet(ls, DIRECTIONS.RIGHT, 182);

      const expected = getLineSet(201);
      expect(result).to.equal(expected);
    });

    it('vertical to doubleV', function () {
      const ls = getLineSet(213);

      const result = interpolateLineSet(ls, DIRECTIONS.BOTTOM, 182);

      const expected = getLineSet(218);
      expect(result).to.equal(expected);
    });
  });

  describe('doubleV attractor', function () {
    it('horizontal to single', function () {
      const ls = getLineSet(214);

      const result = interpolateLineSet(ls, DIRECTIONS.RIGHT, 196);

      const expected = getLineSet(218);
      expect(result).to.equal(expected);
    });

    it('vertical to single', function () {
      const ls = getLineSet(214);

      const result = interpolateLineSet(ls, DIRECTIONS.BOTTOM, 196);

      const expected = getLineSet(214);
      expect(result).to.equal(expected);
    });

    it('horizontal to double', function () {
      const ls = getLineSet(214);

      const result = interpolateLineSet(ls, DIRECTIONS.RIGHT, 205);

      const expected = getLineSet(214);
      expect(result).to.equal(expected);
    });

    it('vertical to double', function () {
      const ls = getLineSet(213);

      const result = interpolateLineSet(ls, DIRECTIONS.BOTTOM, 205);

      const expected = getLineSet(201);
      expect(result).to.equal(expected);
    });

    it('horizontal to doubleH', function () {
      const ls = getLineSet(214);

      const result = interpolateLineSet(ls, DIRECTIONS.RIGHT, 181);

      const expected = getLineSet(214);
      expect(result).to.equal(expected);
    });

    it('vertical to doubleH', function () {
      const ls = getLineSet(214);

      const result = interpolateLineSet(ls, DIRECTIONS.BOTTOM, 181);

      const expected = getLineSet(201);
      expect(result).to.equal(expected);
    });
  });
});
