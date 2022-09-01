import {isBoxChar} from '../boxchars.js';
import codepage from '../codepage.js';
import {COMMANDS} from '../commands.js';
import {EVENTS} from '../refresh.js';
import {View} from './view.js';

function allSelectable(glyphId) {
  return true;
}
function boxSelectable(glyphId) {
  return isBoxChar(glyphId);
}

export class LetterBlock extends View {
  constructor(...args) {
    super(...args);
    this._block = this.doc.getElementById('letter-block');
    this._selectable = allSelectable;
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
    notifier.subscribe(
      EVENTS.onToolChanged, this._updateSelectionMode.bind(this)
    );
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

  _updateSelectionMode(update) {
    const selectable = update.name === 'boxBrush' || update.name === 'boxRect'
                        ? boxSelectable
                        : allSelectable;
    if (selectable !== this._selectable) {
      this._selectable = selectable;
      this._applySelectionPredicate();
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

  _applySelectionPredicate() {
    for (const cell of this._block.children) {
      if (this._selectable(cell.firstElementChild.dataset.id)) {
        cell.classList.remove('disabled');
      } else {
        cell.classList.add('disabled');
      }
    }
  }
}
