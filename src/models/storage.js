import {DEFAULT_GLYPH} from '../codepage.js';
import {COLORS} from '../color.js';
import {TOOLS} from '../tools.js';
import {Cell} from './cell.js';
import {Terminal} from './terminal.js';

export default {
  load() {
    return {
      lettertype: {
        cell: new Cell(DEFAULT_GLYPH, COLORS.black),
        fontSize: 24,
      },
      terminal: new Terminal(50, 20),
      currentTool: TOOLS.brush,
    };
  },
};
