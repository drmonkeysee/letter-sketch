import {CP} from '../codepage.js';
import {COMMANDS} from '../commands.js';
import {EVENTS} from '../refresh.js';
import {View} from './view.js';

export class LetterBlock extends View {
  constructor(...args) {
    super(...args);
    this._block = this.doc.getElementById('letter-block');
  }

  draw(initialState) {
    for (const [id, glyph] of CP.enumerate()) {
      const blockText = this.doc.createElement('span');
      blockText.dataset.id = id;
      blockText.textContent = glyph;

      const blockCell = this.doc.createElement('div');
      blockCell.appendChild(blockText);

      if (id === initialState.glyphId) {
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
    const glyphId = update.glyphId;
    for (const cell of this._block.children) {
      cell.className = cell.firstElementChild.dataset.id === glyphId.toString()
                        ? 'selected'
                        : '';
    }
  }

  _pickGlyph(event) {
    const glyphId = parseInt(event.target.firstElementChild.dataset.id, 10);
    this.dispatch.command(COMMANDS.setGlyph, glyphId);
  }
}
