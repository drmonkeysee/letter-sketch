import {DEFAULT_GLYPH} from '../codepage.js';
import {COLORS} from '../color.js';
import {TOOLS} from '../tools.js';
import {Cell} from './cell.js';
import {Terminal} from './terminal.js';

function lettertype(cell, fontSize, tileSize) {
  return {cell, fontSize, tileSize};
}

export default {
  load() {
    return {
      lettertype: lettertype(new Cell(DEFAULT_GLYPH, COLORS.black), 24),
      terminal: new Terminal(50, 20),
      currentTool: TOOLS.brush
    };
  }
};
