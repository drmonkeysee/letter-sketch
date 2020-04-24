import {expect} from 'chai';
import {CURSOR_GLYPH, TRANSPARENT_GLYPH} from '../src/codepage.js';

import {
  singleCell, freeDraw, floodFill, rectangle, filledRectangle,
  ellipse, filledEllipse, lineSegment, textBuffer,
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

    it('creates a partial ellipse in upper-left', function () {
      const start = {x: 0, y: 0},
            end = {x: 3, y: 3};

      const figure = this._target(start, end);

      const expected = [
        {x: 3, y: 0},
        {x: 3, y: 1},
        {x: 2, y: 2},
        {x: 1, y: 3},
        {x: 0, y: 3},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('creates a partial ellipse in lower-right', function () {
      const start = {x: 6, y: 6},
            end = {x: 3, y: 3};

      const figure = this._target(start, end);

      const expected = [
        {x: 6, y: 3},
        {x: 5, y: 3},
        {x: 4, y: 4},
        {x: 3, y: 5},
        {x: 3, y: 6},
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

    it('creates a partial ellipse in upper-left', function () {
      const start = {x: 0, y: 0},
            end = {x: 3, y: 3};

      const figure = this._target(start, end);

      const expected = [
        {x: 0, y: 0},
        {x: 1, y: 0},
        {x: 2, y: 0},
        {x: 3, y: 0},
        {x: 0, y: 1},
        {x: 1, y: 1},
        {x: 2, y: 1},
        {x: 3, y: 1},
        {x: 0, y: 2},
        {x: 1, y: 2},
        {x: 2, y: 2},
        {x: 1, y: 3},
        {x: 0, y: 3},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('creates a partial ellipse in lower-right', function () {
      const start = {x: 6, y: 6},
            end = {x: 3, y: 3};

      const figure = this._target(start, end);

      const expected = [
        {x: 6, y: 3},
        {x: 5, y: 3},
        {x: 4, y: 4},
        {x: 5, y: 4},
        {x: 6, y: 4},
        {x: 3, y: 5},
        {x: 4, y: 5},
        {x: 5, y: 5},
        {x: 6, y: 5},
        {x: 3, y: 6},
        {x: 4, y: 6},
        {x: 5, y: 6},
        {x: 6, y: 6},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });
  });

  describe('#lineSegment', function () {
    beforeEach(function () {
      this._terminal = new Terminal(7, 7);
      this._cell = new Cell('A');
      this._target = lineSegment(this._cell, this._terminal);
    });

    it('creates a single tile figure', function () {
      const tile = {x: 3, y: 3};

      const figure = this._target(tile, tile);

      expect(figure).to.have.lengthOf(1);
      expect([...figure][0]).to.eql({cell: this._cell, ...tile});
    });

    it('creates a vertical line', function () {
      const start = {x: 3, y: 3},
            end = {x: 3, y: 6};

      const figure = this._target(start, end);

      const expected = [
        {x: 3, y: 3},
        {x: 3, y: 4},
        {x: 3, y: 5},
        {x: 3, y: 6},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('creates a horizontal line', function () {
      const start = {x: 3, y: 3},
            end = {x: 6, y: 3};

      const figure = this._target(start, end);

      const expected = [
        {x: 3, y: 3},
        {x: 4, y: 3},
        {x: 5, y: 3},
        {x: 6, y: 3},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('creates a positive slope', function () {
      const start = {x: 0, y: 0},
            end = {x: 6, y: 6};

      const figure = this._target(start, end);

      const expected = [
        {x: 0, y: 0},
        {x: 1, y: 1},
        {x: 2, y: 2},
        {x: 3, y: 3},
        {x: 4, y: 4},
        {x: 5, y: 5},
        {x: 6, y: 6},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('creates a negative slope', function () {
      const start = {x: 0, y: 6},
            end = {x: 6, y: 0};

      const figure = this._target(start, end);

      const expected = [
        {x: 0, y: 6},
        {x: 1, y: 5},
        {x: 2, y: 4},
        {x: 3, y: 3},
        {x: 4, y: 2},
        {x: 5, y: 1},
        {x: 6, y: 0},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('creates a partial positive slope', function () {
      const start = {x: 0, y: 0},
            end = {x: 6, y: 3};

      const figure = this._target(start, end);

      const expected = [
        {x: 0, y: 0},
        {x: 1, y: 1},
        {x: 2, y: 1},
        {x: 3, y: 2},
        {x: 4, y: 2},
        {x: 5, y: 3},
        {x: 6, y: 3},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });

    it('creates a partial negative slope', function () {
      const start = {x: 0, y: 6},
            end = {x: 6, y: 3};

      const figure = this._target(start, end);

      const expected = [
        {x: 0, y: 6},
        {x: 1, y: 5},
        {x: 2, y: 5},
        {x: 3, y: 4},
        {x: 4, y: 4},
        {x: 5, y: 3},
        {x: 6, y: 3},
      ];
      assertUnorderedFigure(expected, this._cell, figure);
    });
  });

  describe('#textBuffer', function () {
    beforeEach(function () {
      this._terminal = new Terminal(5, 5);
      this._cell = new Cell('A', '#ff0000', '#0000ff');
      this._target = textBuffer(this._cell, this._terminal)
      this._figure = this._target();
    });

    function assertBuffer(expected, srcCell, actual) {
      expect(actual).to.have.lengthOf(expected.length);
      actual = [...actual];
      for (const [i, [char, tile]] of expected.entries()) {
        const cell = new Cell(
          char, srcCell.foregroundColor, srcCell.backgroundColor
        );
        expect(actual[i]).to.eql({cell, ...tile});
      }
    }

    it('returns existing active figure', function () {
      const nextFigure = this._target(null, null, this._figure);

      expect(nextFigure).to.equal(this._figure);
    });

    it('returns empty figure on initial call', function () {
      expect(this._figure).to.have.lengthOf(0);
      expect(this._figure.cursorOn).to.eql(
        new Cell(
          CURSOR_GLYPH, this._cell.foregroundColor, this._cell.backgroundColor
        )
      );
      expect(this._figure.cursorOff).to.eql(
        new Cell(
          TRANSPARENT_GLYPH,
          this._cell.foregroundColor,
          this._cell.backgroundColor
        )
      );
    });

    it('prints single character', function () {
      const tile = {x: 1, y: 1};

      this._figure.advance(tile, 'G')

      expect(this._figure).to.have.lengthOf(1);
      const cell = new Cell(
        'G', this._cell.foregroundColor, this._cell.backgroundColor
      );
      expect([...this._figure][0]).to.eql({cell, ...tile});
    });

    it('prints multiple characters', function () {
      const start = {x: 1, y: 1},
            tiles = [
              ['T', {x: 1, y: 1}],
              ['e', {x: 1, y: 2}],
              ['s', {x: 1, y: 3}],
              ['t', {x: 1, y: 4}],
            ];

      for (const [char, tile] of tiles) {
        this._figure.advance(tile, char);
      }

      assertBuffer(tiles, this._cell, this._figure);
    });

    it('prints non-contiguous characters', function () {
      const start = {x: 1, y: 1},
            tiles = [
              ['T', {x: 0, y: 1}],
              ['e', {x: 3, y: 4}],
              ['s', {x: 2, y: 2}],
              ['t', {x: 1, y: 0}],
            ];

      for (const [char, tile] of tiles) {
        this._figure.advance(tile, char);
      }

      assertBuffer(tiles, this._cell, this._figure);
    });

    it('does nothing for empty reverse', function () {
      this._figure.reverse();

      expect(this._figure).to.have.lengthOf(0);
      expect(this._figure.cursorOn).to.eql(
        new Cell(
          CURSOR_GLYPH, this._cell.foregroundColor, this._cell.backgroundColor
        )
      );
      expect(this._figure.cursorOff).to.eql(
        new Cell(
          TRANSPARENT_GLYPH,
          this._cell.foregroundColor,
          this._cell.backgroundColor
        )
      );
    });

    it('removes trailing character for reverse', function () {
      const start = {x: 1, y: 1},
            tiles = [
              ['T', {x: 1, y: 1}],
              ['e', {x: 1, y: 2}],
              ['s', {x: 1, y: 3}],
              ['t', {x: 1, y: 4}],
            ];
      for (const [char, tile] of tiles) {
        this._figure.advance(tile, char);
      }

      this._figure.reverse();

      assertBuffer(tiles.slice(0, -1), this._cell, this._figure);
    });
  });
});
