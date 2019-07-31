import {expect} from 'chai';

import {singleCell, freeDraw} from '../src/figures.js';
import {Cell} from '../src/models/cell.js';
import {Terminal} from '../src/models/terminal.js';

describe('figures', function () {
  describe('#singleCell', function () {
    beforeEach(function () {
      this._terminal = new Terminal(3, 3);
      this._cell = new Cell('A');
      this._target = singleCell(this._cell, this._terminal);
    });

    it('returns single value figure', function () {
      const tile = {x: 1, y: 2};

      const figure = this._target(tile);

      expect(figure).to.have.lengthOf(1);
      expect(figure[0]).to.eql({x: 1, y: 2, cell: this._cell});
    });

    it('only returns single value figure', function () {
      const tile = {x: 1, y: 2};

      let figure = this._target({x: 1, y: 2});
      figure = this._target({x: 2, y: 0}, null, figure);

      expect(figure).to.have.lengthOf(1);
      expect(figure[0]).to.eql({x: 2, y: 0, cell: this._cell});
    });
  });

  describe('#freeDraw', function () {
    beforeEach(function () {
      this._terminal = new Terminal(3, 3);
      this._cell = new Cell('A');
      this._target = freeDraw(this._cell, this._terminal);
    });

    it('draws starting tile', function () {
      const tile = {x: 1, y: 2};

      const figure = this._target(tile, tile);

      const figureList = [...figure];
      expect(figureList).to.have.lengthOf(1);
      expect(figureList[0]).to.eql({x: 1, y: 2, cell: this._cell});
    });

    it('continues current figure', function () {
      const tiles = [
        {x: 0, y: 0},
        {x: 1, y: 0},
        {x: 1, y: 1},
      ];

      let figure = null;
      for (const tile of tiles) {
        figure = this._target(tiles[0], tile, figure);
      }

      const figureList = [...figure];
      expect(figureList).to.have.lengthOf(tiles.length);
      tiles.forEach((t, i) =>
        expect(figureList[i]).to.eql({x: t.x, y: t.y, cell: this._cell})
      );
    });
  });

  describe('#floodFill', function () {
    beforeEach(function () {
      this._terminal = new Terminal(3, 3);
      this._cell = new Cell('A');
      this._target = freeDraw(this._cell, this._terminal);
    });

    it('fills terminal from middle cell', function () {
      const tile = {x: 1, y: 1};

      const figure = this._target(tile);

      const dims = this._terminal.dimensions;
      expect(figure).to.have.lengthOf(dims.height * dims.width);
      const expectedTiles = [
        {x: 0, y: 0},
        {x: 1, y: 0},
        {x: 2, y: 0},
        {x: 0, y: 1},
        {x: 1, y: 1},
        {x: 2, y: 1},
        {x: 0, y: 2},
        {x: 1, y: 2},
        {x: 2, y: 2},
      ];
      expectedTiles.forEach((t, i) =>
        expect(figure[i]).to.eql({x: t.x, y: t.y, cell: this._cell})
      );
    });

    it('fills terminal from edge cell', function () {
      const tile = {x: 1, y: 2};

      const figure = this._target(tile);

      const dims = this._terminal.dimensions;
      expect(figure).to.have.lengthOf(dims.height * dims.width);
      const expectedTiles = [
        {x: 0, y: 0},
        {x: 1, y: 0},
        {x: 2, y: 0},
        {x: 0, y: 1},
        {x: 1, y: 1},
        {x: 2, y: 1},
        {x: 0, y: 2},
        {x: 1, y: 2},
        {x: 2, y: 2},
      ];
      expectedTiles.forEach((t, i) =>
        expect(figure[i]).to.eql({x: t.x, y: t.y, cell: this._cell})
      );
    });

    it('fills terminal from corner cell', function () {
      const tile = {x: 0, y: 0};

      const figure = this._target(tile);

      const dims = this._terminal.dimensions;
      expect(figure).to.have.lengthOf(dims.height * dims.width);
      const expectedTiles = [
        {x: 0, y: 0},
        {x: 1, y: 0},
        {x: 2, y: 0},
        {x: 0, y: 1},
        {x: 1, y: 1},
        {x: 2, y: 1},
        {x: 0, y: 2},
        {x: 1, y: 2},
        {x: 2, y: 2},
      ];
      expectedTiles.forEach((t, i) =>
        expect(figure[i]).to.eql({x: t.x, y: t.y, cell: this._cell})
      );
    });
  });
});
