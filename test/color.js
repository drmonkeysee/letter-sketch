import {expect} from 'chai';

import {channelsToCss, COLORS} from '../src/color.js';

describe('#channelsToCss()', function () {
  it('parses undefined for all channels', function () {
    const result = channelsToCss();

    expect(result).to.equal('rgb(0, 0, 0)');
  });

  it('parses valid channels', function () {
    const r = 0x22, g = 0x77, b = 0xbb;

    const result = channelsToCss(r, g, b);

    expect(result).to.equal('rgb(34, 119, 187)');
  });

  it('clamps low values', function () {
    const r = -20, g = -1, b = -1024;

    const result = channelsToCss(r, g, b);

    expect(result).to.equal('rgb(0, 0, 0)');
  });

  it('clamps high values', function () {
    const r = 300, g = 256, b = 1024;

    const result = channelsToCss(r, g, b);

    expect(result).to.equal('rgb(255, 255, 255)');
  });
});

describe('COLORS', function () {
  describe('#black', function () {
    it('exists', function () {
      expect(COLORS.black).to.equal('rgb(0, 0, 0)');
    });
  });

  describe('#white', function () {
    it('exists', function () {
      expect(COLORS.white).to.equal('rgb(255, 255, 255)');
    });
  });
});
