import {COLORS} from './color.js';
import {DEFAULT_GLYPH} from '../codepage.js';
import {Cell} from './terminal.js';

export default function (cell = new Cell(DEFAULT_GLYPH, COLORS.black), tileSize = null, fillColor = null) {
  return {
    cell: cell,
    tileSize: tileSize,
    fillColor: fillColor
  };
}
