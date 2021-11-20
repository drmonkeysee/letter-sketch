import {expect} from 'chai';
import codepage from '../src/codepage.js';
import palette from '../src/palette.js';

import {
  boxDraw, boxRectangle, ellipse, filledEllipse, filledRectangle, floodFill,
  freeDraw, lineSegment, rectangle, replace, singleCell, textBuffer,
} from '../src/figures.js';
import {Cell, makeTile} from '../src/models/cell.js';
import {Terminal} from '../src/models/terminal.js';

function assertUnorderedFigure(expTiles, actual, expCell) {
  expect(actual).to.have.lengthOf(expTiles.length);
  for (const tileExpected of expTiles) {
    let foundTile = false;
    for (const tileActual of actual) {
      const sameTile = tileExpected.x === tileActual.x
                        && tileExpected.y === tileActual.y;
      if (!sameTile) continue;
      expect(tileExpected.cell ?? expCell).to.eql(tileActual.cell);
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
      this._cell = new Cell(codepage.id('A'));
    });

    it('returns single value figure', function () {
      const tile = {x: 1, y: 2};

      const figure = singleCell(this._cell, tile);

      expect(figure).to.have.lengthOf(1);
      expect(figure[0]).to.eql({x: 1, y: 2, cell: this._cell});
    });

    it('only returns single value figure', function () {
      const tile = {x: 1, y: 2};

      let figure = singleCell(this._cell, {x: 1, y: 2});
      figure = singleCell(this._cell, {x: 2, y: 0}, null, figure);

      expect(figure).to.have.lengthOf(1);
      expect(figure[0]).to.eql({x: 1, y: 2, cell: this._cell});
    });
  });

  describe('#freeDraw', function () {
    beforeEach(function () {
      this._cell = new Cell(codepage.id('A'));
    });

    it('draws starting tile', function () {
      const tile = {x: 1, y: 2};

      const figure = freeDraw(this._cell, tile, tile);

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
        figure = freeDraw(this._cell, tiles[0], tile, figure);
      }

      expect(figure).to.have.lengthOf(tiles.length);
      const figureList = [...figure];
      tiles.forEach((t, i) =>
        expect(figureList[i]).to.eql({x: t.x, y: t.y, cell: this._cell})
      );
    });
  });

  describe('#boxDraw', function () {
    beforeEach(function () {
      this._terminal = new Terminal(7, 7);
      this._cell = new Cell(218);
    });

    it('draws starting tile', function () {
      const tile = {x: 1, y: 2};

      const figure = boxDraw(this._cell, tile, tile, null, this._terminal);

      expect(figure).to.have.lengthOf(1);
      expect([...figure][0]).to.eql({
        cell: this._cell.clone({glyphId: 196}),
        ...tile,
      });
    });

    it('continues current figure', function () {
      const tiles = [
        {x: 0, y: 0},
        {x: 1, y: 0},
        {x: 1, y: 1},
        {x: 2, y: 1},
      ];

      let figure = null;
      for (const tile of tiles) {
        figure = boxDraw(this._cell, tiles[0], tile, figure, this._terminal);
      }

      const expected = [
        {x: 0, y: 0, cell: this._cell.clone({glyphId: 196})},
        {x: 1, y: 0, cell: this._cell.clone({glyphId: 191})},
        {x: 1, y: 1, cell: this._cell.clone({glyphId: 192})},
        {x: 2, y: 1, cell: this._cell.clone({glyphId: 196})},
      ];
      assertUnorderedFigure(expected, figure);
    });

    it('intersects itself (single)', function () {
      const tiles = [
        {x: 0, y: 0},
        {x: 0, y: 1},
        {x: 0, y: 2},
        {x: 1, y: 2},
        {x: 2, y: 2},
        {x: 3, y: 2},
        {x: 4, y: 2},
        {x: 4, y: 1},
        {x: 4, y: 0},
        {x: 3, y: 0},
        {x: 2, y: 0},
        {x: 2, y: 1},
        {x: 2, y: 2},
        {x: 2, y: 3},
      ];

      let figure = null;
      for (const tile of tiles) {
        figure = boxDraw(this._cell, tiles[0], tile, figure, this._terminal);
      }

      const expected = [
        {x: 0, y: 0, cell: this._cell.clone({glyphId: 179})},
        {x: 0, y: 1, cell: this._cell.clone({glyphId: 179})},
        {x: 0, y: 2, cell: this._cell.clone({glyphId: 192})},
        {x: 1, y: 2, cell: this._cell.clone({glyphId: 196})},
        {x: 2, y: 2, cell: this._cell.clone({glyphId: 197})},
        {x: 3, y: 2, cell: this._cell.clone({glyphId: 196})},
        {x: 4, y: 2, cell: this._cell.clone({glyphId: 217})},
        {x: 4, y: 1, cell: this._cell.clone({glyphId: 179})},
        {x: 4, y: 0, cell: this._cell.clone({glyphId: 191})},
        {x: 3, y: 0, cell: this._cell.clone({glyphId: 196})},
        {x: 2, y: 0, cell: this._cell.clone({glyphId: 218})},
        {x: 2, y: 1, cell: this._cell.clone({glyphId: 179})},
        {x: 2, y: 3, cell: this._cell.clone({glyphId: 179})},
      ];
      assertUnorderedFigure(expected, figure);
    });

    it('intersects itself (double)', function () {
      this._cell = new Cell(201);
      const tiles = [
        {x: 0, y: 0},
        {x: 0, y: 1},
        {x: 0, y: 2},
        {x: 1, y: 2},
        {x: 2, y: 2},
        {x: 3, y: 2},
        {x: 4, y: 2},
        {x: 4, y: 1},
        {x: 4, y: 0},
        {x: 3, y: 0},
        {x: 2, y: 0},
        {x: 2, y: 1},
        {x: 2, y: 2},
        {x: 2, y: 3},
      ];

      let figure = null;
      for (const tile of tiles) {
        figure = boxDraw(this._cell, tiles[0], tile, figure, this._terminal);
      }

      const expected = [
        {x: 0, y: 0, cell: this._cell.clone({glyphId: 186})},
        {x: 0, y: 1, cell: this._cell.clone({glyphId: 186})},
        {x: 0, y: 2, cell: this._cell.clone({glyphId: 200})},
        {x: 1, y: 2, cell: this._cell.clone({glyphId: 205})},
        {x: 2, y: 2, cell: this._cell.clone({glyphId: 206})},
        {x: 3, y: 2, cell: this._cell.clone({glyphId: 205})},
        {x: 4, y: 2, cell: this._cell.clone({glyphId: 188})},
        {x: 4, y: 1, cell: this._cell.clone({glyphId: 186})},
        {x: 4, y: 0, cell: this._cell.clone({glyphId: 187})},
        {x: 3, y: 0, cell: this._cell.clone({glyphId: 205})},
        {x: 2, y: 0, cell: this._cell.clone({glyphId: 201})},
        {x: 2, y: 1, cell: this._cell.clone({glyphId: 186})},
        {x: 2, y: 3, cell: this._cell.clone({glyphId: 186})},
      ];
      assertUnorderedFigure(expected, figure);
    });

    it('intersects itself (doubleH)', function () {
      this._cell = new Cell(213);
      const tiles = [
        {x: 0, y: 0},
        {x: 0, y: 1},
        {x: 0, y: 2},
        {x: 1, y: 2},
        {x: 2, y: 2},
        {x: 3, y: 2},
        {x: 4, y: 2},
        {x: 4, y: 1},
        {x: 4, y: 0},
        {x: 3, y: 0},
        {x: 2, y: 0},
        {x: 2, y: 1},
        {x: 2, y: 2},
        {x: 2, y: 3},
      ];

      let figure = null;
      for (const tile of tiles) {
        figure = boxDraw(this._cell, tiles[0], tile, figure, this._terminal);
      }

      const expected = [
        {x: 0, y: 0, cell: this._cell.clone({glyphId: 179})},
        {x: 0, y: 1, cell: this._cell.clone({glyphId: 179})},
        {x: 0, y: 2, cell: this._cell.clone({glyphId: 212})},
        {x: 1, y: 2, cell: this._cell.clone({glyphId: 205})},
        {x: 2, y: 2, cell: this._cell.clone({glyphId: 216})},
        {x: 3, y: 2, cell: this._cell.clone({glyphId: 205})},
        {x: 4, y: 2, cell: this._cell.clone({glyphId: 190})},
        {x: 4, y: 1, cell: this._cell.clone({glyphId: 179})},
        {x: 4, y: 0, cell: this._cell.clone({glyphId: 184})},
        {x: 3, y: 0, cell: this._cell.clone({glyphId: 205})},
        {x: 2, y: 0, cell: this._cell.clone({glyphId: 213})},
        {x: 2, y: 1, cell: this._cell.clone({glyphId: 179})},
        {x: 2, y: 3, cell: this._cell.clone({glyphId: 179})},
      ];
      assertUnorderedFigure(expected, figure);
    });

    it('intersects itself (doubleV)', function () {
      this._cell = new Cell(214);
      const tiles = [
        {x: 0, y: 0},
        {x: 0, y: 1},
        {x: 0, y: 2},
        {x: 1, y: 2},
        {x: 2, y: 2},
        {x: 3, y: 2},
        {x: 4, y: 2},
        {x: 4, y: 1},
        {x: 4, y: 0},
        {x: 3, y: 0},
        {x: 2, y: 0},
        {x: 2, y: 1},
        {x: 2, y: 2},
        {x: 2, y: 3},
      ];

      let figure = null;
      for (const tile of tiles) {
        figure = boxDraw(this._cell, tiles[0], tile, figure, this._terminal);
      }

      const expected = [
        {x: 0, y: 0, cell: this._cell.clone({glyphId: 186})},
        {x: 0, y: 1, cell: this._cell.clone({glyphId: 186})},
        {x: 0, y: 2, cell: this._cell.clone({glyphId: 211})},
        {x: 1, y: 2, cell: this._cell.clone({glyphId: 196})},
        {x: 2, y: 2, cell: this._cell.clone({glyphId: 215})},
        {x: 3, y: 2, cell: this._cell.clone({glyphId: 196})},
        {x: 4, y: 2, cell: this._cell.clone({glyphId: 189})},
        {x: 4, y: 1, cell: this._cell.clone({glyphId: 186})},
        {x: 4, y: 0, cell: this._cell.clone({glyphId: 183})},
        {x: 3, y: 0, cell: this._cell.clone({glyphId: 196})},
        {x: 2, y: 0, cell: this._cell.clone({glyphId: 214})},
        {x: 2, y: 1, cell: this._cell.clone({glyphId: 186})},
        {x: 2, y: 3, cell: this._cell.clone({glyphId: 186})},
      ];
      assertUnorderedFigure(expected, figure);
    });

    it('interpolates an intersecting neighbor', function () {
      this._cell = new Cell(205);
      this._terminal.updateCell(2, 2, {glyphId: 196});
      this._terminal.updateCell(3, 2, {glyphId: 196});
      this._terminal.updateCell(4, 2, {glyphId: 196});
      const start = {x: 3, y: 3};

      const figure = boxDraw(this._cell, start, start, null, this._terminal);

      const expected = [
        {x: 3, y: 3, cell: this._cell.clone({glyphId: 186})},
        {x: 3, y: 2, cell: this._cell.clone({glyphId: 210})},
      ];
      assertUnorderedFigure(expected, figure);
    });

    it('does not interpolate a non-intersecting neighbor', function () {
      this._cell = new Cell(205);
      this._terminal.updateCell(2, 2, {glyphId: 65});
      this._terminal.updateCell(3, 2, {glyphId: 65});
      this._terminal.updateCell(4, 2, {glyphId: 65});
      const start = {x: 3, y: 3};

      const figure = boxDraw(this._cell, start, start, null, this._terminal);

      const expected = [
        {x: 3, y: 3, cell: this._cell.clone({glyphId: 205})},
      ];
      assertUnorderedFigure(expected, figure);
    });
  });

  describe('#floodFill', function () {
    beforeEach(function () {
      this._terminal = new Terminal(3, 3);
      this._cell = new Cell(codepage.id('A'));
    });

    it('fills terminal from middle cell', function () {
      const tile = {x: 1, y: 1};

      const figure = floodFill(this._cell, tile, null, null, this._terminal);

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
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('fills terminal from edge cell', function () {
      const tile = {x: 1, y: 2};

      const figure = floodFill(this._cell, tile, null, null, this._terminal);

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
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('fills terminal from corner cell', function () {
      const tile = {x: 0, y: 0};

      const figure = floodFill(this._cell, tile, null, null, this._terminal);

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
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('does not fill past solid line', function () {
      const cell = new Cell(codepage.id('X')),
            verticalLine = [
              {x: 1, y: 0, cell},
              {x: 1, y: 1, cell},
              {x: 1, y: 2, cell},
            ];
      this._terminal.update(verticalLine);
      const tile = {x: 0, y: 0};

      const figure = floodFill(this._cell, tile, null, null, this._terminal);

      const expected = [
        {x: 0, y: 0},
        {x: 0, y: 1},
        {x: 0, y: 2},
      ];
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('does not fill past diagonal line', function () {
      const cell = new Cell(codepage.id('X')),
            diag = [
              {x: 2, y: 0, cell},
              {x: 1, y: 1, cell},
              {x: 0, y: 2, cell},
            ];
      this._terminal.update(diag);
      const tile = {x: 0, y: 0};

      const figure = floodFill(this._cell, tile, null, null, this._terminal);

      const expected = [
        {x: 0, y: 0},
        {x: 0, y: 1},
        {x: 1, y: 0},
      ];
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('fills single tile', function () {
      const tile = {x: 1, y: 1};
      this._terminal.update([{cell: new Cell(codepage.id('X')), ...tile}]);

      const figure = floodFill(this._cell, tile, null, null, this._terminal);

      assertUnorderedFigure([tile], figure, this._cell);
    });

    it('fills solid line', function () {
      const cell = new Cell(codepage.id('X')),
            verticalLine = [
              {x: 1, y: 0, cell},
              {x: 1, y: 1, cell},
              {x: 1, y: 2, cell},
            ];
      this._terminal.update(verticalLine);
      const tile = {x: 1, y: 1};

      const figure = floodFill(this._cell, tile, null, null, this._terminal);

      const expected = [
        {x: 1, y: 0},
        {x: 1, y: 1},
        {x: 1, y: 2},
      ];
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('does not fill diagonal line', function () {
      const cell = new Cell(codepage.id('X')),
            diag = [
              {x: 2, y: 0, cell},
              {x: 1, y: 1, cell},
              {x: 0, y: 2, cell},
            ];
      this._terminal.update(diag);
      const tile = {x: 0, y: 2};

      const figure = floodFill(this._cell, tile, null, null, this._terminal);

      const expected = [
        {x: 0, y: 2},
      ];
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('fills contiguous shape', function () {
      const cell = new Cell(codepage.id('X')),
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
      this._terminal.update(square);
      const tile = {x: 1, y: 1};

      const figure = floodFill(this._cell, tile, null, null, this._terminal);

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
      assertUnorderedFigure(expected, figure, this._cell);
    });
  });

  describe('#rectangle', function () {
    beforeEach(function () {
      this._cell = new Cell(codepage.id('A'));
    });

    it('creates a single tile figure', function () {
      const tile = {x: 3, y: 3};

      const figure = rectangle(this._cell, tile, tile);

      expect(figure).to.have.lengthOf(1);
      expect([...figure][0]).to.eql({cell: this._cell, ...tile});
    });

    it('creates a 2-tile horizontal rect', function () {
      const start = {x: 3, y: 3},
            end = {x: 4, y: 3};

      const figure = rectangle(this._cell, start, end);

      const expected = [start, end];
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('creates a 2-tile vertical rect', function () {
      const start = {x: 3, y: 3},
            end = {x: 3, y: 4};

      const figure = rectangle(this._cell, start, end);

      const expected = [start, end];
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('creates a 4-tile square', function () {
      const start = {x: 3, y: 3},
            end = {x: 4, y: 4};

      const figure = rectangle(this._cell, start, end);

      const expected = [
        {x: 3, y: 3},
        {x: 3, y: 4},
        {x: 4, y: 3},
        {x: 4, y: 4},
      ];
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('creates an LT open square', function () {
      const start = {x: 3, y: 3},
            end = {x: 5, y: 5};

      const figure = rectangle(this._cell, start, end);

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
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('creates an RB open square', function () {
      const start = {x: 3, y: 3},
            end = {x: 1, y: 1};

      const figure = rectangle(this._cell, start, end);

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
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('creates an open horizontal rect', function () {
      const start = {x: 3, y: 3},
            end = {x: 6, y: 5};

      const figure = rectangle(this._cell, start, end);

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
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('creates an open vertical rect', function () {
      const start = {x: 3, y: 3},
            end = {x: 5, y: 6};

      const figure = rectangle(this._cell, start, end);

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
      assertUnorderedFigure(expected, figure, this._cell);
    });
  });

  describe('#filledRectangle', function () {
    beforeEach(function () {
      this._cell = new Cell(codepage.id('A'));
    });

    it('creates a single tile figure', function () {
      const tile = {x: 3, y: 3};

      const figure = filledRectangle(this._cell, tile, tile);

      expect(figure).to.have.lengthOf(1);
      expect(figure[0]).to.eql({cell: this._cell, ...tile});
    });

    it('creates a 2-tile horizontal rect', function () {
      const start = {x: 3, y: 3},
            end = {x: 4, y: 3};

      const figure = filledRectangle(this._cell, start, end);

      const expected = [start, end];
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('creates a 2-tile vertical rect', function () {
      const start = {x: 3, y: 3},
            end = {x: 3, y: 4};

      const figure = filledRectangle(this._cell, start, end);

      const expected = [start, end];
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('creates a 4-tile square', function () {
      const start = {x: 3, y: 3},
            end = {x: 4, y: 4};

      const figure = filledRectangle(this._cell, start, end);

      const expected = [
        {x: 3, y: 3},
        {x: 3, y: 4},
        {x: 4, y: 3},
        {x: 4, y: 4},
      ];
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('creates an LT solid square', function () {
      const start = {x: 3, y: 3},
            end = {x: 5, y: 5};

      const figure = filledRectangle(this._cell, start, end);

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
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('creates an RB solid square', function () {
      const start = {x: 3, y: 3},
            end = {x: 1, y: 1};

      const figure = filledRectangle(this._cell, start, end);

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
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('creates a solid horizontal rect', function () {
      const start = {x: 3, y: 3},
            end = {x: 6, y: 5};

      const figure = filledRectangle(this._cell, start, end);

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
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('creates a solid vertical rect', function () {
      const start = {x: 3, y: 3},
            end = {x: 5, y: 6};

      const figure = filledRectangle(this._cell, start, end);

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
      assertUnorderedFigure(expected, figure, this._cell);
    });
  });

  describe('#boxRectangle', function () {
    beforeEach(function () {
      this._terminal = new Terminal(7, 7);
      this._cell = new Cell(218);
    });

    it('creates a single tile figure', function () {
      const tile = {x: 3, y: 3};

      const figure = boxRectangle(
        this._cell, tile, tile, null, this._terminal
      );

      expect(figure).to.have.lengthOf(1);
      expect([...figure][0]).to.eql({
        cell: this._cell.clone({glyphId: 196}),
        ...tile,
      });
    });

    it('creates a 2-tile horizontal rect', function () {
      const start = {x: 3, y: 3, cell: this._cell.clone({glyphId: 196})},
            end = {x: 4, y: 3, cell: this._cell.clone({glyphId: 196})};

      const figure = boxRectangle(
        this._cell, start, end, null, this._terminal
      );

      const expected = [start, end];
      assertUnorderedFigure(expected, figure);
    });

    it('creates a 2-tile vertical rect', function () {
      const start = {x: 3, y: 3, cell: this._cell.clone({glyphId: 179})},
            end = {x: 3, y: 4, cell: this._cell.clone({glyphId: 179})};

      const figure = boxRectangle(
        this._cell, start, end, null, this._terminal
      );

      const expected = [start, end];
      assertUnorderedFigure(expected, figure);
    });

    it('creates a 4-tile square', function () {
      const start = {x: 3, y: 3},
            end = {x: 4, y: 4};

      const figure = boxRectangle(
        this._cell, start, end, null, this._terminal
      );

      const expected = [
        {x: 3, y: 3, cell: this._cell.clone({glyphId: 218})},
        {x: 3, y: 4, cell: this._cell.clone({glyphId: 192})},
        {x: 4, y: 3, cell: this._cell.clone({glyphId: 191})},
        {x: 4, y: 4, cell: this._cell.clone({glyphId: 217})},
      ];
      assertUnorderedFigure(expected, figure);
    });

    it('creates a 9-tile square (single)', function () {
      const start = {x: 3, y: 3},
            end = {x: 5, y: 5};

      const figure = boxRectangle(
        this._cell, start, end, null, this._terminal
      );

      const expected = [
        {x: 3, y: 3, cell: this._cell.clone({glyphId: 218})},
        {x: 3, y: 4, cell: this._cell.clone({glyphId: 179})},
        {x: 3, y: 5, cell: this._cell.clone({glyphId: 192})},
        {x: 4, y: 3, cell: this._cell.clone({glyphId: 196})},
        {x: 4, y: 5, cell: this._cell.clone({glyphId: 196})},
        {x: 5, y: 3, cell: this._cell.clone({glyphId: 191})},
        {x: 5, y: 4, cell: this._cell.clone({glyphId: 179})},
        {x: 5, y: 5, cell: this._cell.clone({glyphId: 217})},
      ];
      assertUnorderedFigure(expected, figure);
    });

    it('creates a 9-tile square (double)', function () {
      this._cell = new Cell(201);
      const start = {x: 3, y: 3},
            end = {x: 5, y: 5};

      const figure = boxRectangle(
        this._cell, start, end, null, this._terminal
      );

      const expected = [
        {x: 3, y: 3, cell: this._cell.clone({glyphId: 201})},
        {x: 3, y: 4, cell: this._cell.clone({glyphId: 186})},
        {x: 3, y: 5, cell: this._cell.clone({glyphId: 200})},
        {x: 4, y: 3, cell: this._cell.clone({glyphId: 205})},
        {x: 4, y: 5, cell: this._cell.clone({glyphId: 205})},
        {x: 5, y: 3, cell: this._cell.clone({glyphId: 187})},
        {x: 5, y: 4, cell: this._cell.clone({glyphId: 186})},
        {x: 5, y: 5, cell: this._cell.clone({glyphId: 188})},
      ];
      assertUnorderedFigure(expected, figure);
    });

    it('creates a 9-tile square (doubleH)', function () {
      this._cell = new Cell(213);
      const start = {x: 3, y: 3},
            end = {x: 5, y: 5};

      const figure = boxRectangle(
        this._cell, start, end, null, this._terminal
      );

      const expected = [
        {x: 3, y: 3, cell: this._cell.clone({glyphId: 213})},
        {x: 3, y: 4, cell: this._cell.clone({glyphId: 179})},
        {x: 3, y: 5, cell: this._cell.clone({glyphId: 212})},
        {x: 4, y: 3, cell: this._cell.clone({glyphId: 205})},
        {x: 4, y: 5, cell: this._cell.clone({glyphId: 205})},
        {x: 5, y: 3, cell: this._cell.clone({glyphId: 184})},
        {x: 5, y: 4, cell: this._cell.clone({glyphId: 179})},
        {x: 5, y: 5, cell: this._cell.clone({glyphId: 190})},
      ];
      assertUnorderedFigure(expected, figure);
    });

    it('creates a 9-tile square (doubleV)', function () {
      this._cell = new Cell(214);
      const start = {x: 3, y: 3},
            end = {x: 5, y: 5};

      const figure = boxRectangle(
        this._cell, start, end, null, this._terminal
      );

      const expected = [
        {x: 3, y: 3, cell: this._cell.clone({glyphId: 214})},
        {x: 3, y: 4, cell: this._cell.clone({glyphId: 186})},
        {x: 3, y: 5, cell: this._cell.clone({glyphId: 211})},
        {x: 4, y: 3, cell: this._cell.clone({glyphId: 196})},
        {x: 4, y: 5, cell: this._cell.clone({glyphId: 196})},
        {x: 5, y: 3, cell: this._cell.clone({glyphId: 183})},
        {x: 5, y: 4, cell: this._cell.clone({glyphId: 186})},
        {x: 5, y: 5, cell: this._cell.clone({glyphId: 189})},
      ];
      assertUnorderedFigure(expected, figure);
    });

    it('creates a 9-tile square (non-box)', function () {
      this._cell = new Cell(codepage.id('A'));
      const start = {x: 3, y: 3},
            end = {x: 5, y: 5};

      const figure = boxRectangle(
        this._cell, start, end, null, this._terminal
      );

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
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('interpolates an intersecting neighbor', function () {
      this._terminal.updateCell(4, 5, {glyphId: 186});
      const start = {x: 3, y: 3},
            end = {x: 5, y: 4};

      const figure = boxRectangle(
        this._cell, start, end, null, this._terminal
      );

      const expected = [
        {x: 3, y: 3, cell: this._cell.clone({glyphId: 218})},
        {x: 3, y: 4, cell: this._cell.clone({glyphId: 192})},
        {x: 4, y: 3, cell: this._cell.clone({glyphId: 196})},
        {x: 4, y: 4, cell: this._cell.clone({glyphId: 210})},
        {x: 5, y: 3, cell: this._cell.clone({glyphId: 191})},
        {x: 5, y: 4, cell: this._cell.clone({glyphId: 217})},
      ];
      assertUnorderedFigure(expected, figure);
    });

    it('does not interpolate a non-intersecting neighbor', function () {
      this._terminal.updateCell(4, 5, {glyphId: 205});
      const start = {x: 3, y: 3},
            end = {x: 5, y: 4};

      const figure = boxRectangle(
        this._cell, start, end, null, this._terminal
      );

      const expected = [
        {x: 3, y: 3, cell: this._cell.clone({glyphId: 218})},
        {x: 3, y: 4, cell: this._cell.clone({glyphId: 192})},
        {x: 4, y: 3, cell: this._cell.clone({glyphId: 196})},
        {x: 4, y: 4, cell: this._cell.clone({glyphId: 196})},
        {x: 5, y: 3, cell: this._cell.clone({glyphId: 191})},
        {x: 5, y: 4, cell: this._cell.clone({glyphId: 217})},
      ];
      assertUnorderedFigure(expected, figure);
    });
  });

  describe('#ellipse', function () {
    beforeEach(function () {
      this._terminal = new Terminal(7, 7);
      this._cell = new Cell(codepage.id('A'));
    });

    it('creates a single tile figure', function () {
      const tile = {x: 3, y: 3};

      const figure = ellipse(this._cell, tile, tile, null, this._terminal);

      expect(figure).to.have.lengthOf(1);
      expect([...figure][0]).to.eql({cell: this._cell, ...tile});
    });

    it('creates a vertical figure', function () {
      const start = {x: 3, y: 3},
            end = {x: 3, y: 6};

      const figure = ellipse(this._cell, start, end, null, this._terminal);

      const expected = [
        {x: 3, y: 0},
        {x: 3, y: 1},
        {x: 3, y: 2},
        {x: 3, y: 3},
        {x: 3, y: 4},
        {x: 3, y: 5},
        {x: 3, y: 6},
      ];
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('creates a horizontal figure', function () {
      const start = {x: 3, y: 3},
            end = {x: 6, y: 3};

      const figure = ellipse(this._cell, start, end, null, this._terminal);

      const expected = [
        {x: 0, y: 3},
        {x: 1, y: 3},
        {x: 2, y: 3},
        {x: 3, y: 3},
        {x: 4, y: 3},
        {x: 5, y: 3},
        {x: 6, y: 3},
      ];
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('creates a 2x2 ellipse', function () {
      const start = {x: 3, y: 3},
            end = {x: 4, y: 4};

      const figure = ellipse(this._cell, start, end, null, this._terminal);

      const expected = [
        {x: 2, y: 3},
        {x: 3, y: 2},
        {x: 3, y: 4},
        {x: 4, y: 3},
      ];
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('creates a thin vertical ellipse', function () {
      const start = {x: 3, y: 3},
            end = {x: 4, y: 6};

      const figure = ellipse(this._cell, start, end, null, this._terminal);

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
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('creates a thin horizontal ellipse', function () {
      const start = {x: 3, y: 3},
            end = {x: 6, y: 4};

      const figure = ellipse(this._cell, start, end, null, this._terminal);

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
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('creates a full ellipse', function () {
      const start = {x: 3, y: 3},
            end = {x: 6, y: 6};

      const figure = ellipse(this._cell, start, end, null, this._terminal);

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
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('creates a top-left full ellipse', function () {
      const start = {x: 3, y: 3},
            end = {x: 0, y: 0};

      const figure = ellipse(this._cell, start, end, null, this._terminal);

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
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('creates a partial ellipse in upper-left', function () {
      const start = {x: 0, y: 0},
            end = {x: 3, y: 3};

      const figure = ellipse(this._cell, start, end, null, this._terminal);

      const expected = [
        {x: 3, y: 0},
        {x: 3, y: 1},
        {x: 2, y: 2},
        {x: 1, y: 3},
        {x: 0, y: 3},
      ];
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('creates a partial ellipse in lower-right', function () {
      const start = {x: 6, y: 6},
            end = {x: 3, y: 3};

      const figure = ellipse(this._cell, start, end, null, this._terminal);

      const expected = [
        {x: 6, y: 3},
        {x: 5, y: 3},
        {x: 4, y: 4},
        {x: 3, y: 5},
        {x: 3, y: 6},
      ];
      assertUnorderedFigure(expected, figure, this._cell);
    });
  });

  describe('#filledEllipse', function () {
    beforeEach(function () {
      this._terminal = new Terminal(7, 7);
      this._cell = new Cell(codepage.id('A'));
    });

    it('creates a single tile figure', function () {
      const tile = {x: 3, y: 3};

      const figure = filledEllipse(
        this._cell, tile, tile, null, this._terminal
      );

      expect(figure).to.have.lengthOf(1);
      expect([...figure][0]).to.eql({cell: this._cell, ...tile});
    });

    it('creates a vertical figure', function () {
      const start = {x: 3, y: 3},
            end = {x: 3, y: 6};

      const figure = filledEllipse(
        this._cell, start, end, null, this._terminal
      );

      const expected = [
        {x: 3, y: 0},
        {x: 3, y: 1},
        {x: 3, y: 2},
        {x: 3, y: 3},
        {x: 3, y: 4},
        {x: 3, y: 5},
        {x: 3, y: 6},
      ];
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('creates a horizontal figure', function () {
      const start = {x: 3, y: 3},
            end = {x: 6, y: 3};

      const figure = filledEllipse(
        this._cell, start, end, null, this._terminal
      );

      const expected = [
        {x: 0, y: 3},
        {x: 1, y: 3},
        {x: 2, y: 3},
        {x: 3, y: 3},
        {x: 4, y: 3},
        {x: 5, y: 3},
        {x: 6, y: 3},
      ];
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('creates a 2x2 ellipse', function () {
      const start = {x: 3, y: 3},
            end = {x: 4, y: 4};

      const figure = filledEllipse(
        this._cell, start, end, null, this._terminal
      );

      const expected = [
        {x: 2, y: 3},
        {x: 3, y: 2},
        {x: 3, y: 3},
        {x: 3, y: 4},
        {x: 4, y: 3},
      ];
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('creates a thin vertical ellipse', function () {
      const start = {x: 3, y: 3},
            end = {x: 4, y: 6};

      const figure = filledEllipse(
        this._cell, start, end, null, this._terminal
      );

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
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('creates a thin horizontal ellipse', function () {
      const start = {x: 3, y: 3},
            end = {x: 6, y: 4};

      const figure = filledEllipse(
        this._cell, start, end, null, this._terminal
      );

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
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('creates a full ellipse', function () {
      const start = {x: 3, y: 3},
            end = {x: 6, y: 6};

      const figure = filledEllipse(
        this._cell, start, end, null, this._terminal
      );

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
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('creates a top-left full ellipse', function () {
      const start = {x: 3, y: 3},
            end = {x: 0, y: 0};

      const figure = filledEllipse(
        this._cell, start, end, null, this._terminal
      );

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
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('creates a partial ellipse in upper-left', function () {
      const start = {x: 0, y: 0},
            end = {x: 3, y: 3};

      const figure = filledEllipse(
        this._cell, start, end, null, this._terminal
      );

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
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('creates a partial ellipse in lower-right', function () {
      const start = {x: 6, y: 6},
            end = {x: 3, y: 3};

      const figure = filledEllipse(
        this._cell, start, end, null, this._terminal
      );

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
      assertUnorderedFigure(expected, figure, this._cell);
    });
  });

  describe('#lineSegment', function () {
    beforeEach(function () {
      this._cell = new Cell(codepage.id('A'));
    });

    it('creates a single tile figure', function () {
      const tile = {x: 3, y: 3};

      const figure = lineSegment(this._cell, tile, tile);

      expect(figure).to.have.lengthOf(1);
      expect([...figure][0]).to.eql({cell: this._cell, ...tile});
    });

    it('creates a vertical line', function () {
      const start = {x: 3, y: 3},
            end = {x: 3, y: 6};

      const figure = lineSegment(this._cell, start, end);

      const expected = [
        {x: 3, y: 3},
        {x: 3, y: 4},
        {x: 3, y: 5},
        {x: 3, y: 6},
      ];
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('creates a horizontal line', function () {
      const start = {x: 3, y: 3},
            end = {x: 6, y: 3};

      const figure = lineSegment(this._cell, start, end);

      const expected = [
        {x: 3, y: 3},
        {x: 4, y: 3},
        {x: 5, y: 3},
        {x: 6, y: 3},
      ];
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('creates a positive slope', function () {
      const start = {x: 0, y: 0},
            end = {x: 6, y: 6};

      const figure = lineSegment(this._cell, start, end);

      const expected = [
        {x: 0, y: 0},
        {x: 1, y: 1},
        {x: 2, y: 2},
        {x: 3, y: 3},
        {x: 4, y: 4},
        {x: 5, y: 5},
        {x: 6, y: 6},
      ];
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('creates a negative slope', function () {
      const start = {x: 0, y: 6},
            end = {x: 6, y: 0};

      const figure = lineSegment(this._cell, start, end);

      const expected = [
        {x: 0, y: 6},
        {x: 1, y: 5},
        {x: 2, y: 4},
        {x: 3, y: 3},
        {x: 4, y: 2},
        {x: 5, y: 1},
        {x: 6, y: 0},
      ];
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('creates a partial positive slope', function () {
      const start = {x: 0, y: 0},
            end = {x: 6, y: 3};

      const figure = lineSegment(this._cell, start, end);

      const expected = [
        {x: 0, y: 0},
        {x: 1, y: 1},
        {x: 2, y: 1},
        {x: 3, y: 2},
        {x: 4, y: 2},
        {x: 5, y: 3},
        {x: 6, y: 3},
      ];
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('creates a partial negative slope', function () {
      const start = {x: 0, y: 6},
            end = {x: 6, y: 3};

      const figure = lineSegment(this._cell, start, end);

      const expected = [
        {x: 0, y: 6},
        {x: 1, y: 5},
        {x: 2, y: 5},
        {x: 3, y: 4},
        {x: 4, y: 4},
        {x: 5, y: 3},
        {x: 6, y: 3},
      ];
      assertUnorderedFigure(expected, figure, this._cell);
    });
  });

  describe('#textBuffer', function () {
    beforeEach(function () {
      this._terminal = new Terminal(5, 5);
      this._cell = new Cell(
        codepage.id('A'), palette.id('#ff0000'), palette.id('#0000ff')
      );
      this._figure = textBuffer(this._cell)
    });

    function assertBuffer(expected, srcCell, actual, expectedLength) {
      expect(actual).to.have.lengthOf(expectedLength || expected.length);
      actual = [...actual];
      for (const [i, [char, tile]] of expected.entries()) {
        const cell = srcCell.clone({glyphId: char});
        expect(actual[i]).to.eql({cell, ...tile});
      }
    }

    it('returns existing active figure', function () {
      const nextFigure = textBuffer(this._cell, null, null, this._figure);

      expect(nextFigure).to.equal(this._figure);
    });

    it('returns empty figure on initial call', function () {
      expect(this._figure).to.have.lengthOf(0);
      expect(this._figure.cursorOn).to.eql(
        this._cell.clone({glyphId: codepage.SIGILS.CURSOR})
      );
      expect(this._figure.cursorOff).to.eql(
        this._cell.clone({glyphId: codepage.SIGILS.TRANSPARENT})
      );
    });

    it('prints single character', function () {
      const tile = {x: 1, y: 1};

      this._figure.advance(tile, 71)

      expect(this._figure).to.have.lengthOf(1);
      const cell = this._cell.clone({glyphId: 71});
      expect([...this._figure][0]).to.eql({cell, ...tile});
    });

    it('prints multiple characters', function () {
      const start = {x: 1, y: 1},
            tiles = [
              [84  /*'T'*/, {x: 1, y: 1}],
              [101 /*'e'*/, {x: 1, y: 2}],
              [115 /*'s'*/, {x: 1, y: 3}],
              [116 /*'t'*/, {x: 1, y: 4}],
            ];

      for (const [char, tile] of tiles) {
        this._figure.advance(tile, char);
      }

      assertBuffer(tiles, this._cell, this._figure);
    });

    it('prints non-contiguous characters', function () {
      const start = {x: 1, y: 1},
            tiles = [
              [84  /*'T'*/, {x: 0, y: 1}],
              [101 /*'e'*/, {x: 3, y: 4}],
              [115 /*'s'*/, {x: 2, y: 2}],
              [116 /*'t'*/, {x: 1, y: 0}],
            ];

      for (const [char, tile] of tiles) {
        this._figure.advance(tile, char);
      }

      assertBuffer(tiles, this._cell, this._figure);
    });

    it('does nothing for empty reverse', function () {
      const tile = this._figure.reverse();

      expect(tile).to.be.undefined;
      expect(this._figure).to.have.lengthOf(0);
    });

    it('removes trailing character for reverse', function () {
      const start = {x: 1, y: 1},
            tiles = [
              [84  /*'T'*/, {x: 1, y: 1}],
              [101 /*'e'*/, {x: 1, y: 2}],
              [115 /*'s'*/, {x: 1, y: 3}],
              [116 /*'t'*/, {x: 1, y: 4}],
            ];
      for (const [char, tile] of tiles) {
        this._figure.advance(tile, char);
      }

      const tile = this._figure.reverse();

      assertBuffer(tiles.slice(0, -1), this._cell, this._figure);
      expect(tile).to.eql({
          x: 1,
          y: 4,
          cell: this._cell.clone({glyphId: 116}),
        }
      );
    });

    it('adds sentinel for newline', function () {
      const tile = {x: 1, y: 3};

      this._figure.newline(tile);

      const sentinel = this._figure.reverse();
      expect(sentinel).to.eql({x: 1, y: 3, cell: codepage.SIGILS.NEWLINE});
    });

    it('does not include sentinels in iterator', function () {
      const start = {x: 1, y: 1},
            tiles = [
              [84  /*'T'*/, {x: 0, y: 1}],
              [101 /*'e'*/, {x: 3, y: 4}],
              [115 /*'s'*/, {x: 2, y: 2}],
              [116 /*'t'*/, {x: 1, y: 1}],
            ];

      for (const [char, tile] of tiles) {
        this._figure.advance(tile, char);
        this._figure.newline({x: tile.x + 1, y: tile.y - 1});
      }

      assertBuffer(tiles, this._cell, this._figure, 8);
    });
  });

  describe('#replace', function () {
    beforeEach(function () {
      this._terminal = new Terminal(4, 4);
      const terminalState = [
        new Cell(), new Cell(), new Cell(codepage.id('b'), '#ffffff'),
          new Cell(codepage.id('b')),
        new Cell(codepage.id('a'), palette.id('#ffffff')), new Cell(),
          new Cell(codepage.id('b')),
          new Cell(
            codepage.id('b'), palette.id('#ff0000'), palette.id('#0000ff')
          ),
        new Cell(codepage.id('a')), new Cell(codepage.id('c')), new Cell(),
          new Cell(
            codepage.id('b'), palette.id('#ff0000'), palette.id('#0000ff')
          ),
        new Cell(codepage.id('a')), new Cell(codepage.id('a')),
          new Cell(
            codepage.id('a'), palette.id('#ff0000'), palette.id('#0000ff')
          ),
          new Cell(
            codepage.id('a'), palette.id('#ff0000'), palette.id('#0000ff')
          ),
      ];
      let x = 0, y = 0;
      this._terminal.update(
        terminalState.map(c => {
          const t = makeTile(x++, y, c);
          if (x >= 4) {
            x = 0;
            ++y;
          }
          return t;
        })
      );
      this._cell = new Cell(
        codepage.id('X'), palette.id('#00ff00'), palette.id('#00ff00')
      );
    });

    it('returns existing active figure', function () {
      const existingFigure = [];

      const nextFigure = replace(
        this._cell, null, null, existingFigure, this._terminal
      );

      expect(nextFigure).to.equal(existingFigure);
    });

    it('does nothing if new cell matches target cell', function () {
      const figure = replace(
        new Cell(
          codepage.id('b'), palette.id('#ff0000'), palette.id('#0000ff')
        ),
        {x: 3, y: 1},
        null,
        null,
        this._terminal
      );

      expect(figure).to.be.empty;
    });

    it('replaces default tiles', function () {
      const figure = replace(
        this._cell, {x: 0, y: 0}, null, null, this._terminal
      );

      const expected = [
        {x: 0, y: 0},
        {x: 1, y: 0},
        {x: 1, y: 1},
        {x: 2, y: 2},
      ];
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('replaces basic glyph tiles', function () {
      const figure = replace(
        this._cell, {x: 0, y: 2}, null, null, this._terminal
      );

      const expected = [
        {x: 0, y: 2},
        {x: 1, y: 3},
        {x: 1, y: 3},
      ];
      assertUnorderedFigure(expected, figure, this._cell);
    });

    it('replaces single tile', function () {
      const figure = replace(
        this._cell, {x: 2, y: 0}, null, null, this._terminal
      );

      const expected = [
        {x: 2, y: 0},
      ];
      assertUnorderedFigure(expected, figure, this._cell);
    });
  });
});
