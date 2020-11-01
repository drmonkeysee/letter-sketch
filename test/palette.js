import {expect} from 'chai';

import palette from '../src/palette.js';

describe('#cssColor()', function () {
  it('returns expected value for id', function () {
    const result = palette.cssColor(5);

    expect(result).to.equal('rgb(0, 128, 255)');
  });

  it('returns undefined if invalid id', function () {
    const result = palette.cssColor(1000);

    expect(result).to.be.undefined;
  });
});

describe('#id()', function () {
  it('returns expected id for value', function () {
    const result = palette.id('rgb(0, 128, 255)');

    expect(result).to.equal(5);
  });

  it('returns invalid id for unknown color', function () {
    const result = palette.id('foobar');

    expect(result).to.equal(-1);
  });

  it('returns id for hex color', function () {
    const result = palette.id('#80ff00');

    expect(result).to.equal(15);
  });

  it('returns id for short hex color', function () {
    const result = palette.id('#fff');

    expect(result).to.equal(26);
  });

  it('returns invalid id for malformed hex string', function () {
    const result = palette.id('#foobar');

    expect(result).to.equal(-1);
  });

  it('returns invalid id for invalid hex string', function () {
    const result = palette.id('#barf');

    expect(result).to.equal(-1);
  });
});

describe('COLORS', function () {
  describe('#black', function () {
    it('exists', function () {
      expect(palette.COLORS.BLACK).to.equal(0);
    });

    it('matches expected css color', function () {
      const result = palette.cssColor(palette.COLORS.BLACK);

      expect(result).to.equal('rgb(0, 0, 0)');
    });
  });

  describe('#white', function () {
    it('exists', function () {
      expect(palette.COLORS.WHITE).to.equal(26);
    });

    it('matches expected css color', function () {
      const result = palette.cssColor(palette.COLORS.WHITE);

      expect(result).to.equal('rgb(255, 255, 255)');
    });
  });
});
