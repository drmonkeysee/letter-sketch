import {expect} from 'chai';
import {channelsToCss} from '../../src/models/color.js';

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
