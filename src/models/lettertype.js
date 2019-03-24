import {COLORS} from '../color.js';
import {DEFAULT_GLYPH} from '../codepage.js';
import {Cell} from './cell.js';

export default function (cell = new Cell(DEFAULT_GLYPH, COLORS.black), tileSize, fillColor) {
  return {cell, tileSize, fillColor};
}
