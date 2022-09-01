import codepage from '../codepage.js';
import {COMMANDS} from '../commands.js';
import {EVENTS} from '../refresh.js';
import {View} from './view.js';

export class LetterBlock extends View {
  constructor(...args) {
    super(...args);
    this._block = this.doc.getElementById('letter-block');
  }

  draw(initialState) {
    for (const [id, glyph] of codepage.enumerate()) {
      const blockText = this.doc.createElement('span');
      blockText.dataset.id = id;
      blockText.textContent = glyph;

      const blockCell = this.doc.createElement('div');
      blockCell.appendChild(blockText);

      if (id === initialState.glyphId) {
        blockCell.className = 'selected';
        this._selectedBlock = blockCell;
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
      if (cell.firstElementChild.dataset.id === glyphId.toString()) {
        this._selectedBlock.classList.remove('selected');
        cell.className = 'selected';
        this._selectedBlock = cell;
        break;
      }
    }
  }

  _pickGlyph(event) {
    const target = event.target;
    if (target.classList.contains('disabled')) {
      event.preventDefault();
    } else {
      const glyphId = parseInt(target.firstElementChild.dataset.id, 10);
      this.dispatch.command(COMMANDS.setGlyph, glyphId);
    }
  }
}
