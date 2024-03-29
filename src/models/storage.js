import codepage from '../codepage.js';
import {TOOLS} from '../tools.js';
import {Cell} from './cell.js';
import {Terminal} from './terminal.js';

export default {
  load() {
    return {
      currentTool: TOOLS.brush,
      lettertype: {
        cell: new Cell(codepage.SIGILS.DEFAULT),
        fontSize: 20,
      },
      terminal: new Terminal(80, 25),
    };
  },
};
