import {DEFAULT_GLYPH} from '../codepage.js';
import {COLORS} from '../color.js';
import {Cell} from './cell.js';

export default function (cell = new Cell(DEFAULT_GLYPH, COLORS.black), fontSize = 24, tileSize) {
  return {cell, fontSize, tileSize};
}
