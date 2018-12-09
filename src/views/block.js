import {View} from './view.js';
import {CP437} from '../codepage.js';
import {EVENTS} from '../refresh.js';
import {COMMANDS} from '../commands.js';

export class LetterBlock extends View {
  constructor(...args) {
    super(...args);
    this._block = this._doc.getElementById('letter-block');
  }

  draw(initialState) {
    for (const glyph of CP437) {
      const blockText = this._doc.createElement('span');
      blockText.textContent = glyph;
      
      const blockCell = this._doc.createElement('div');
      blockCell.appendChild(blockText);
      
      blockCell.style.height = `${1.5 * initialState.tileSize.height}px`;
      if (glyph === initialState.glyph) {
        blockCell.className = 'selected';
      }
      
      blockCell.addEventListener('click', this._pickGlyph.bind(this));
      this._block.appendChild(blockCell);
    }
  }

  subscribe(notifier) {
    notifier.subscribe(EVENTS.onGlyphChanged, this._refreshGlyph.bind(this));
  }

  _refreshGlyph(update) {
    const glyph = update.glyph;
    for (const cell of this._block.children) {
      cell.className = cell.firstElementChild.textContent === glyph ? 'selected' : null;
    }
  }

  _pickGlyph(event) {
    this._dispatch.command(COMMANDS.setGlyph, event.target.firstElementChild.textContent);
  }
}
