import {expect} from 'chai';

import {
  singleCell, freeDraw, floodFill, rectangle, filledRectangle,
  ellipse, filledEllipse,
} from '../src/figures.js';
import {Cell} from '../src/models/cell.js';
import {Terminal} from '../src/models/terminal.js';

function assertUnorderedFigure(expTiles, expCell, actual) {
  expect(actual).to.have.lengthOf(expTiles.length);
  for (const tileExpected of expTiles) {
    let foundTile = false;
    for (const tileActual of actual) {
      const sameTile = tileExpected.x === tileActual.x
                        && tileExpected.y === tileActual.y;
      if (!sameTile) continue;
      expect(tileActual.cell).to.equal(expCell);
      foundTile = true;
    }
    if (!foundTile) {
      expect.fail(
        `Expected tile {x: ${tileExpected.x}, y: ${tileExpected.y}}`
        + ' not found in figure'
      );
    }
  }
}

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
      expect(figure[0]).to.eql({x: 1, y: 2, cell: this._cell});
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

      expect(figure).to.have.lengthOf(1);
      expect([...figure][0]).to.eql({x: 1, y: 2, cell: this._cell});
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

      expect(figure).to.have.lengthOf(tiles.length);
      const figureList = [...figure];
      tiles.forEach((t, i) =>
        expect(figureList[i]).to.eql({x: t.x, y: t.y, cell: this._cell})
      );
    });
  });

  describe('#floodFill', function () {
    beforeEach(function () {
      this._terminal = new Terminal(3, 3);
      this._cell = new Cell('A');
      this._target = floodFill(this._cell, this._terminal);
    });

    it('fills terminal from middle cell', function () {
      const tile = {x: 1, y: 1};

      const figure = this._target(tile);

      const expected = [
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
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('fills terminal from edge cell', function () {
      const tile = {x: 1, y: 2};

      const figure = this._target(tile);

      const expected = [
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
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('fills terminal from corner cell', function () {
      const tile = {x: 0, y: 0};

      const figure = this._target(tile);

      const expected = [
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
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('does not fill past solid line', function () {
      const cell = new Cell('X'),
            verticalLine = [
              {x: 1, y: 0, cell},
              {x: 1, y: 1, cell},
              {x: 1, y: 2, cell},
            ];
      this._terminal.update(verticalLine);
      const tile = {x: 0, y: 0};

      const figure = this._target(tile);

      const expected = [
        {x: 0, y: 0},
        {x: 0, y: 1},
        {x: 0, y: 2},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('does not fill past diagonal line', function () {
      const cell = new Cell('X'),
            diag = [
              {x: 2, y: 0, cell},
              {x: 1, y: 1, cell},
              {x: 0, y: 2, cell},
            ];
      this._terminal.update(diag);
      const tile = {x: 0, y: 0};

      const figure = this._target(tile);

      const expected = [
        {x: 0, y: 0},
        {x: 0, y: 1},
        {x: 1, y: 0},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('fills single tile', function () {
      const tile = {x: 1, y: 1};
      this._terminal.update([{cell: new Cell('X'), ...tile}]);

      const figure = this._target(tile);

      assertUnorderedFigure([tile], this._cell, figure);
    });

    it('fills solid line', function () {
      const cell = new Cell('X'),
            verticalLine = [
              {x: 1, y: 0, cell},
              {x: 1, y: 1, cell},
              {x: 1, y: 2, cell},
            ];
      this._terminal.update(verticalLine);
      const tile = {x: 1, y: 1};

      const figure = this._target(tile);

      const expected = [
        {x: 1, y: 0},
        {x: 1, y: 1},
        {x: 1, y: 2},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('does not fill diagonal line', function () {
      const cell = new Cell('X'),
            diag = [
              {x: 2, y: 0, cell},
              {x: 1, y: 1, cell},
              {x: 0, y: 2, cell},
            ];
      this._terminal.update(diag);
      const tile = {x: 0, y: 2};

      const figure = this._target(tile);

      const expected = [
        {x: 0, y: 2},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('fills contiguous shape', function () {
      const cell = new Cell('X'),
            square = [
              {x: 1, y: 1, cell},
              {x: 2, y: 1, cell},
              {x: 3, y: 1, cell},
              {x: 1, y: 2, cell},
              {x: 3, y: 2, cell},
              {x: 1, y: 3, cell},
              {x: 2, y: 3, cell},
              {x: 3, y: 3, cell},
            ];
      this._terminal.resize(5, 5);
      // NOTE: reset target after resizing terminal
      this._target = floodFill(this._cell, this._terminal);
      this._terminal.update(square);
      const tile = {x: 1, y: 1};

      const figure = this._target(tile);

      const expected = [
        {x: 1, y: 1},
        {x: 2, y: 1},
        {x: 3, y: 1},
        {x: 1, y: 2},
        {x: 3, y: 2},
        {x: 1, y: 3},
        {x: 2, y: 3},
        {x: 3, y: 3},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });
  });

  describe('#rectangle', function () {
    beforeEach(function () {
      this._terminal = new Terminal(7, 7);
      this._cell = new Cell('A');
      this._target = rectangle(this._cell, this._terminal);
    });

    it('creates a single tile figure', function () {
      const tile = {x: 3, y: 3};

      const figure = this._target(tile, tile);

      expect(figure).to.have.lengthOf(1);
      expect([...figure][0]).to.eql({cell: this._cell, ...tile});
    });

    it('creates a 2-tile horizontal rect', function () {
      const start = {x: 3, y: 3},
            end = {x: 4, y: 3};

      const figure = this._target(start, end);

      const expected = [start, end];
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('creates a 2-tile vertical rect', function () {
      const start = {x: 3, y: 3},
            end = {x: 3, y: 4};

      const figure = this._target(start, end);

      const expected = [start, end];
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('creates a 4-tile square', function () {
      const start = {x: 3, y: 3},
            end = {x: 4, y: 4};

      const figure = this._target(start, end);

      const expected = [
        {x: 3, y: 3},
        {x: 3, y: 4},
        {x: 4, y: 3},
        {x: 4, y: 4},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('creates an LT open square', function () {
      const start = {x: 3, y: 3},
            end = {x: 5, y: 5};

      const figure = this._target(start, end);

      const expected = [
        {x: 3, y: 3},
        {x: 3, y: 4},
        {x: 3, y: 5},
        {x: 4, y: 3},
        {x: 4, y: 5},
        {x: 5, y: 3},
        {x: 5, y: 4},
        {x: 5, y: 5},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('creates an RB open square', function () {
      const start = {x: 3, y: 3},
            end = {x: 1, y: 1};

      const figure = this._target(start, end);

      const expected = [
        {x: 1, y: 1},
        {x: 1, y: 2},
        {x: 1, y: 3},
        {x: 2, y: 1},
        {x: 2, y: 3},
        {x: 3, y: 1},
        {x: 3, y: 2},
        {x: 3, y: 3},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('creates an open horizontal rect', function () {
      const start = {x: 3, y: 3},
            end = {x: 6, y: 5};

      const figure = this._target(start, end);

      const expected = [
        {x: 3, y: 3},
        {x: 4, y: 3},
        {x: 5, y: 3},
        {x: 6, y: 3},
        {x: 3, y: 4},
        {x: 6, y: 4},
        {x: 3, y: 5},
        {x: 4, y: 5},
        {x: 5, y: 5},
        {x: 6, y: 5},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('creates an open vertical rect', function () {
      const start = {x: 3, y: 3},
            end = {x: 5, y: 6};

      const figure = this._target(start, end);

      const expected = [
        {x: 3, y: 3},
        {x: 3, y: 4},
        {x: 3, y: 5},
        {x: 3, y: 6},
        {x: 4, y: 3},
        {x: 4, y: 6},
        {x: 5, y: 3},
        {x: 5, y: 4},
        {x: 5, y: 5},
        {x: 5, y: 6},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });
  });

  describe('#filledRectangle', function () {
    beforeEach(function () {
      this._terminal = new Terminal(7, 7);
      this._cell = new Cell('A');
      this._target = filledRectangle(this._cell, this._terminal);
    });

    it('creates a single tile figure', function () {
      const tile = {x: 3, y: 3};

      const figure = this._target(tile, tile);

      expect(figure).to.have.lengthOf(1);
      expect(figure[0]).to.eql({cell: this._cell, ...tile});
    });

    it('creates a 2-tile horizontal rect', function () {
      const start = {x: 3, y: 3},
            end = {x: 4, y: 3};

      const figure = this._target(start, end);

      const expected = [start, end];
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('creates a 2-tile vertical rect', function () {
      const start = {x: 3, y: 3},
            end = {x: 3, y: 4};

      const figure = this._target(start, end);

      const expected = [start, end];
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('creates a 4-tile square', function () {
      const start = {x: 3, y: 3},
            end = {x: 4, y: 4};

      const figure = this._target(start, end);

      const expected = [
        {x: 3, y: 3},
        {x: 3, y: 4},
        {x: 4, y: 3},
        {x: 4, y: 4},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('creates an LT solid square', function () {
      const start = {x: 3, y: 3},
            end = {x: 5, y: 5};

      const figure = this._target(start, end);

      const expected = [
        {x: 3, y: 3},
        {x: 3, y: 4},
        {x: 3, y: 5},
        {x: 4, y: 3},
        {x: 4, y: 4},
        {x: 4, y: 5},
        {x: 5, y: 3},
        {x: 5, y: 4},
        {x: 5, y: 5},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('creates an RB solid square', function () {
      const start = {x: 3, y: 3},
            end = {x: 1, y: 1};

      const figure = this._target(start, end);

      const expected = [
        {x: 1, y: 1},
        {x: 1, y: 2},
        {x: 1, y: 3},
        {x: 2, y: 1},
        {x: 2, y: 2},
        {x: 2, y: 3},
        {x: 3, y: 1},
        {x: 3, y: 2},
        {x: 3, y: 3},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('creates a solid horizontal rect', function () {
      const start = {x: 3, y: 3},
            end = {x: 6, y: 5};

      const figure = this._target(start, end);

      const expected = [
        {x: 3, y: 3},
        {x: 4, y: 3},
        {x: 5, y: 3},
        {x: 6, y: 3},
        {x: 3, y: 4},
        {x: 4, y: 4},
        {x: 5, y: 4},
        {x: 6, y: 4},
        {x: 3, y: 5},
        {x: 4, y: 5},
        {x: 5, y: 5},
        {x: 6, y: 5},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('creates a solid vertical rect', function () {
      const start = {x: 3, y: 3},
            end = {x: 5, y: 6};

      const figure = this._target(start, end);

      const expected = [
        {x: 3, y: 3},
        {x: 3, y: 4},
        {x: 3, y: 5},
        {x: 3, y: 6},
        {x: 4, y: 3},
        {x: 4, y: 4},
        {x: 4, y: 5},
        {x: 4, y: 6},
        {x: 5, y: 3},
        {x: 5, y: 4},
        {x: 5, y: 5},
        {x: 5, y: 6},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });
  });

  describe('#ellipse', function () {
    beforeEach(function () {
      this._terminal = new Terminal(7, 7);
      this._cell = new Cell('A');
      this._target = ellipse(this._cell, this._terminal);
    });

    it('creates a single tile figure', function () {
      const tile = {x: 3, y: 3};

      const figure = this._target(tile, tile);

      expect(figure).to.have.lengthOf(1);
      expect([...figure][0]).to.eql({cell: this._cell, ...tile});
    });

    it('creates a vertical figure', function () {
      const start = {x: 3, y: 3},
            end = {x: 3, y: 6};

      const figure = this._target(start, end);

      const expected = [
        {x: 3, y: 0},
        {x: 3, y: 1},
        {x: 3, y: 2},
        {x: 3, y: 3},
        {x: 3, y: 4},
        {x: 3, y: 5},
        {x: 3, y: 6},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('creates a horizontal figure', function () {
      const start = {x: 3, y: 3},
            end = {x: 6, y: 3};

      const figure = this._target(start, end);

      const expected = [
        {x: 0, y: 3},
        {x: 1, y: 3},
        {x: 2, y: 3},
        {x: 3, y: 3},
        {x: 4, y: 3},
        {x: 5, y: 3},
        {x: 6, y: 3},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('creates a 2x2 ellipse', function () {
      const start = {x: 3, y: 3},
            end = {x: 4, y: 4};

      const figure = this._target(start, end);

      const expected = [
        {x: 2, y: 3},
        {x: 3, y: 2},
        {x: 3, y: 4},
        {x: 4, y: 3},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('creates a thin vertical ellipse', function () {
      const start = {x: 3, y: 3},
            end = {x: 4, y: 6};

      const figure = this._target(start, end);

      const expected = [
        {x: 3, y: 0},
        {x: 2, y: 1},
        {x: 4, y: 1},
        {x: 2, y: 2},
        {x: 4, y: 2},
        {x: 2, y: 3},
        {x: 4, y: 3},
        {x: 2, y: 4},
        {x: 4, y: 4},
        {x: 2, y: 5},
        {x: 4, y: 5},
        {x: 3, y: 6},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('creates a thin horizontal ellipse', function () {
      const start = {x: 3, y: 3},
            end = {x: 6, y: 4};

      const figure = this._target(start, end);

      const expected = [
        {x: 0, y: 3},
        {x: 1, y: 2},
        {x: 1, y: 4},
        {x: 2, y: 2},
        {x: 2, y: 4},
        {x: 3, y: 2},
        {x: 3, y: 4},
        {x: 4, y: 2},
        {x: 4, y: 4},
        {x: 5, y: 2},
        {x: 5, y: 4},
        {x: 6, y: 3},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('creates a full ellipse', function () {
      const start = {x: 3, y: 3},
            end = {x: 6, y: 6};

      const figure = this._target(start, end);

      const expected = [
        {x: 2, y: 0},
        {x: 3, y: 0},
        {x: 4, y: 0},
        {x: 1, y: 1},
        {x: 5, y: 1},
        {x: 0, y: 2},
        {x: 6, y: 2},
        {x: 0, y: 3},
        {x: 6, y: 3},
        {x: 0, y: 4},
        {x: 6, y: 4},
        {x: 1, y: 5},
        {x: 5, y: 5},
        {x: 2, y: 6},
        {x: 3, y: 6},
        {x: 4, y: 6},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('creates a top-left full ellipse', function () {
      const start = {x: 3, y: 3},
            end = {x: 0, y: 0};

      const figure = this._target(start, end);

      const expected = [
        {x: 2, y: 0},
        {x: 3, y: 0},
        {x: 4, y: 0},
        {x: 1, y: 1},
        {x: 5, y: 1},
        {x: 0, y: 2},
        {x: 6, y: 2},
        {x: 0, y: 3},
        {x: 6, y: 3},
        {x: 0, y: 4},
        {x: 6, y: 4},
        {x: 1, y: 5},
        {x: 5, y: 5},
        {x: 2, y: 6},
        {x: 3, y: 6},
        {x: 4, y: 6},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });
  });

  describe('#filledEllipse', function () {
    beforeEach(function () {
      this._terminal = new Terminal(7, 7);
      this._cell = new Cell('A');
      this._target = filledEllipse(this._cell, this._terminal);
    });

    it('creates a single tile figure', function () {
      const tile = {x: 3, y: 3};

      const figure = this._target(tile, tile);

      expect(figure).to.have.lengthOf(1);
      expect([...figure][0]).to.eql({cell: this._cell, ...tile});
    });

    it('creates a vertical figure', function () {
      const start = {x: 3, y: 3},
            end = {x: 3, y: 6};

      const figure = this._target(start, end);

      const expected = [
        {x: 3, y: 0},
        {x: 3, y: 1},
        {x: 3, y: 2},
        {x: 3, y: 3},
        {x: 3, y: 4},
        {x: 3, y: 5},
        {x: 3, y: 6},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('creates a horizontal figure', function () {
      const start = {x: 3, y: 3},
            end = {x: 6, y: 3};

      const figure = this._target(start, end);

      const expected = [
        {x: 0, y: 3},
        {x: 1, y: 3},
        {x: 2, y: 3},
        {x: 3, y: 3},
        {x: 4, y: 3},
        {x: 5, y: 3},
        {x: 6, y: 3},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('creates a 2x2 ellipse', function () {
      const start = {x: 3, y: 3},
            end = {x: 4, y: 4};

      const figure = this._target(start, end);

      const expected = [
        {x: 2, y: 3},
        {x: 3, y: 2},
        {x: 3, y: 3},
        {x: 3, y: 4},
        {x: 4, y: 3},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('creates a thin vertical ellipse', function () {
      const start = {x: 3, y: 3},
            end = {x: 4, y: 6};

      const figure = this._target(start, end);

      const expected = [
        {x: 3, y: 0},
        {x: 2, y: 1},
        {x: 3, y: 1},
        {x: 4, y: 1},
        {x: 2, y: 2},
        {x: 3, y: 2},
        {x: 4, y: 2},
        {x: 2, y: 3},
        {x: 3, y: 3},
        {x: 4, y: 3},
        {x: 2, y: 4},
        {x: 3, y: 4},
        {x: 4, y: 4},
        {x: 2, y: 5},
        {x: 3, y: 5},
        {x: 4, y: 5},
        {x: 3, y: 6},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('creates a thin horizontal ellipse', function () {
      const start = {x: 3, y: 3},
            end = {x: 6, y: 4};

      const figure = this._target(start, end);

      const expected = [
        {x: 0, y: 3},
        {x: 1, y: 2},
        {x: 1, y: 3},
        {x: 1, y: 4},
        {x: 2, y: 2},
        {x: 2, y: 3},
        {x: 2, y: 4},
        {x: 2, y: 2},
        {x: 2, y: 3},
        {x: 3, y: 4},
        {x: 4, y: 2},
        {x: 4, y: 3},
        {x: 4, y: 4},
        {x: 5, y: 2},
        {x: 5, y: 3},
        {x: 5, y: 4},
        {x: 6, y: 3},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('creates a full ellipse', function () {
      const start = {x: 3, y: 3},
            end = {x: 6, y: 6};

      const figure = this._target(start, end);

      const expected = [
        {x: 2, y: 0},
        {x: 3, y: 0},
        {x: 4, y: 0},
        {x: 1, y: 1},
        {x: 2, y: 1},
        {x: 3, y: 1},
        {x: 4, y: 1},
        {x: 5, y: 1},
        {x: 0, y: 2},
        {x: 1, y: 2},
        {x: 2, y: 2},
        {x: 3, y: 2},
        {x: 4, y: 2},
        {x: 5, y: 2},
        {x: 6, y: 2},
        {x: 0, y: 3},
        {x: 1, y: 3},
        {x: 2, y: 3},
        {x: 3, y: 3},
        {x: 4, y: 3},
        {x: 5, y: 3},
        {x: 6, y: 3},
        {x: 0, y: 4},
        {x: 1, y: 4},
        {x: 2, y: 4},
        {x: 3, y: 4},
        {x: 4, y: 4},
        {x: 5, y: 4},
        {x: 6, y: 4},
        {x: 1, y: 5},
        {x: 2, y: 5},
        {x: 3, y: 5},
        {x: 4, y: 5},
        {x: 5, y: 5},
        {x: 2, y: 6},
        {x: 3, y: 6},
        {x: 4, y: 6},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('creates a top-left full ellipse', function () {
      const start = {x: 3, y: 3},
            end = {x: 0, y: 0};

      const figure = this._target(start, end);

      const expected = [
        {x: 2, y: 0},
        {x: 3, y: 0},
        {x: 4, y: 0},
        {x: 1, y: 1},
        {x: 2, y: 1},
        {x: 3, y: 1},
        {x: 4, y: 1},
        {x: 5, y: 1},
        {x: 0, y: 2},
        {x: 1, y: 2},
        {x: 2, y: 2},
        {x: 3, y: 2},
        {x: 4, y: 2},
        {x: 5, y: 2},
        {x: 6, y: 2},
        {x: 0, y: 3},
        {x: 1, y: 3},
        {x: 2, y: 3},
        {x: 3, y: 3},
        {x: 4, y: 3},
        {x: 5, y: 3},
        {x: 6, y: 3},
        {x: 0, y: 4},
        {x: 1, y: 4},
        {x: 2, y: 4},
        {x: 3, y: 4},
        {x: 4, y: 4},
        {x: 5, y: 4},
        {x: 6, y: 4},
        {x: 1, y: 5},
        {x: 2, y: 5},
        {x: 3, y: 5},
        {x: 4, y: 5},
        {x: 5, y: 5},
        {x: 2, y: 6},
        {x: 3, y: 6},
        {x: 4, y: 6},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });
  });
});
