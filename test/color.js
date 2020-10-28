import {expect} from 'chai';

import color from '../src/color.js';

describe('#cssColor()', function () {
  it('returns expected value for id', function () {
    const result = color.cssColor(5);

    expect(result).to.equal('rgb(0, 128, 255)');
  });

  it('returns undefined if invalid id', function () {
    const result = color.cssColor(1000);

    expect(result).to.be.undefined;
  });
});

describe('#id()', function () {
  it('returns expected id for value', function () {
    const result = color.id('rgb(0, 128, 255)');

    expect(result).to.equal(5);
  });

  it('returns invalid id for unknown color', function () {
    const result = color.id('foobar');

    expect(result).to.equal(-1);
  });

  it('returns id for hex color', function () {
    const result = color.id('#80ff00');

    expect(result).to.equal(15);
  });

  it('returns id for short hex color', function () {
    const result = color.id('#fff');

    expect(result).to.equal(26);
  });

  it('returns invalid id for malformed hex string', function () {
    const result = color.id('#foobar');

    expect(result).to.equal(-1);
  });

  it('returns invalid id for invalid hex string', function () {
    const result = color.id('#barf');

    expect(result).to.equal(-1);
  });
});

describe('COLORS', function () {
  describe('#black', function () {
    it('exists', function () {
      expect(color.COLORS.black).to.equal(0);
    });

    it('matches expected css color', function () {
      const result = color.cssColor(color.COLORS.black);

      expect(result).to.equal('rgb(0, 0, 0)');
    });
  });

  describe('#white', function () {
    it('exists', function () {
      expect(color.COLORS.white).to.equal(26);
    });

    it('matches expected css color', function () {
      const result = color.cssColor(color.COLORS.white);

      expect(result).to.equal('rgb(255, 255, 255)');
    });
  });
});
