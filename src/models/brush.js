import {COLORS} from './color.js';
import {DEFAULT_GLYPH} from '../codepage.js';
import {makeCell} from './terminal.js';

export default function (cell = makeCell(DEFAULT_GLYPH, COLORS.black), tileSize = null, fillColor = null) {
  return {
    cell: cell,
    tileSize: tileSize,
    fillColor: fillColor
  };
}
