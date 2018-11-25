import {expect} from 'chai';
import makeNamemap from '../../src/models/namemap.js';

describe('#makeNamemap', function () {
  before(function () {
    this.makeItems = count => {
      function* gen(n) {
        for (let i = 0; i < n; ++i) yield {name: `Foo${i}`, val: i};
      }
      return Array.from(gen(count));
    };

    this.mapItemVal = (n, i) => `${name}-${val}`;
  });

  it('creates empty map if empty items', function () {
    const items = this.makeItems();

    const result = makeNamemap(items, this.mapItemVal);

    const expected = {};
    expect(result).to.equal(expected);
  });

  it('creates map from named items', function () {
    expect.fail('not implemented');
  });

  it('uses custom name mapper', function () {
    expect.fail('not implemented');
  });

  it('creates map from string items', function () {
    expect.fail('not implemented');
  });
});
