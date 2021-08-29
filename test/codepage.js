import {expect} from 'chai';

import codepage from '../src/codepage.js';

describe('#glyph()', function () {
  it('returns expected value for id', function () {
    const result = codepage.glyph(65);

    expect(result).to.equal('A');
  });

  it('returns undefined if invalid id', function () {
    const result = codepage.glyph(1000);

    expect(result).to.be.undefined;
  });
});

describe('#id()', function () {
  it('returns expected id for glyph', function() {
    const result = codepage.id('#');

    expect(result).to.equal(35);
  });

  it('returns invalid id for unknown glyph', function () {
    const result = codepage.id('元');

    expect(result).to.equal(-1);
  });
});
