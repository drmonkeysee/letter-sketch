import {expect} from 'chai';

import namemap from '../src/namemap.js';

describe('#namemap()', function () {
  before(function () {
    this.makeItems = count => {
      function* gen(n) {
        for (let i = 0; i < n; ++i) yield {name: `Foo${i}`, val: i};
      }
      return Array.from(gen(count));
    };
    this.mapItem = (n, i) => `${i.name.slice(0, -1)}(${n}-${10 + i.val})`;
  });

  it('creates empty map if empty items', function () {
    const items = this.makeItems();

    const result = namemap(items, this.mapItem);

    expect(result).to.be.empty;
  });

  it('creates map from named items', function () {
    const items = this.makeItems(3);

    const result = namemap(items, this.mapItem);

    const expected = {
      foo0: 'Foo(foo0-10)',
      foo1: 'Foo(foo1-11)',
      foo2: 'Foo(foo2-12)',
    };
    expect(result).to.be.deep.equal(expected);
  });

  it('creates map from string items', function () {
    const items = ['Foo', 'Bar', 'Baz'],
          mapItem = (n, i) => `${n}(${i})`;

    const result = namemap(items, mapItem);

    const expected = {
      foo: 'foo(Foo)',
      bar: 'bar(Bar)',
      baz: 'baz(Baz)',
    };
    expect(result).to.be.deep.equal(expected);
  });

  it('creates map from string objects', function () {
    const items = [new String('Foo'), new String('Bar'), new String('Baz')],
          mapItem = (n, i) => `${n}(${i})`;

    const result = namemap(items, mapItem);

    const expected = {
      foo: 'foo(Foo)',
      bar: 'bar(Bar)',
      baz: 'baz(Baz)',
    };
    expect(result).to.be.deep.equal(expected);
  });
});
