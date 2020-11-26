import {Cell} from './cell.js';
import codepage from '../codepage.js';
import {Terminal} from './terminal.js';
import {TOOLS} from '../tools.js';

export default {
  load() {
    return {
      lettertype: {
        cell: new Cell(codepage.SIGILS.DEFAULT),
        fontSize: 24,
      },
      terminal: new Terminal(50, 20),
      currentTool: TOOLS.brush,
    };
  },
};
