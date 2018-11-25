import {View} from './view.js';
import {CP437} from '../codepage.js';

export class LetterBlock extends View {
  constructor(...args) {
    super(...args);
    this._block = this._doc.getElementById('letter-block');
  }

  draw() {
    for (const letter of CP437) {
      const blockText = this._doc.createElement('span');
      blockText.textContent = letter;
      
      const blockCell = this._doc.createElement('div');
      blockCell.appendChild(blockText);
      // TODO: figure out how to set these from brush
      //blockCell.style.height = `${1.5 * brush.tileSize.height}px`;
      if (letter === 'A') {
        blockCell.className = 'selected';
      }
      this._block.appendChild(blockCell);
    }
  }
}
