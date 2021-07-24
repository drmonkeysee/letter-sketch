import {Cell} from './cell.js';
import codepage from '../codepage.js';
import {Terminal} from './terminal.js';
import {TOOLS} from '../tools.js';

export default {
  load() {
    return {
      currentTool: TOOLS.brush,
      lettertype: {
        cell: new Cell(codepage.SIGILS.DEFAULT),
        fontSize: 24,
      },
      boxMode: false,
      terminal: new Terminal(50, 20),
    };
  },
};
