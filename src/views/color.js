import {COMMANDS} from '../commands.js';
import palette from '../palette.js';
import {EVENTS} from '../refresh.js';
import {View} from './view.js';

class ColorSelection extends View {
  constructor(id, cmd, refreshEvent, onSelected, colorInitializer, ...args) {
    super(...args);
    this._selection = this.doc.getElementById(id);
    this.cmd = cmd;
    this.refreshEvent = refreshEvent;
    this.onSelected = onSelected;
    this.colorInitializer = colorInitializer;
  }

  draw(initialState) {
    this._setColor(this.colorInitializer(initialState.colors));
    this._selection.addEventListener('click', e => this.onSelected(this));
  }

  subscribe(notifier) {
    notifier.subscribe(this.refreshEvent, this._refreshColor.bind(this));
  }

  select() {
    this._selection.classList.add('selected');
  }

  deselect() {
    this._selection.classList.remove('selected');
  }

  pick(colorId) {
    this.dispatch.command(this.cmd, colorId);
  }

  _refreshColor(update) {
    this._setColor(update.colorId);
  }

  _setColor(colorId) {
    this._selection.style.backgroundColor = palette.cssColor(colorId);
    this._selection.title = palette.name(colorId);
  }
}

export class ColorPalette extends View {
  constructor(...args) {
    super(...args);
    this._palette = this.doc.getElementById('palette');
    const onSelectedHandler = this._setSelection.bind(this);
    this._colorSelections = [
      new ColorSelection(
        'fg-color',
        COMMANDS.setForegroundColor,
        EVENTS.onForegroundColorChanged,
        onSelectedHandler,
        colors => colors.fg,
        ...args
      ),
      new ColorSelection(
        'bg-color',
        COMMANDS.setBackgroundColor,
        EVENTS.onBackgroundColorChanged,
        onSelectedHandler,
        colors => colors.bg,
        ...args
      ),
    ];
  }

  draw(initialState) {
    for (const [colorId, colorValue] of palette.enumerate()) {
      const colorCell = this.doc.createElement('div');
      colorCell.className = 'palette-cell';
      colorCell.dataset.id = colorId;
      colorCell.title = palette.name(colorId);
      colorCell.style.backgroundColor = colorValue;
      colorCell.addEventListener('click', this._pickColor.bind(this));
      this._palette.appendChild(colorCell);
    }

    for (const selectionView of this._colorSelections) {
      selectionView.draw(initialState);
    }
    this._setSelection(this._colorSelections[0]);
  }

  subscribe(notifier) {
    for (const selectionView of this._colorSelections) {
      selectionView.subscribe(notifier);
    }
  }

  _setSelection(selectionView) {
    for (const view of this._colorSelections) {
      view.deselect();
    }
    selectionView.select();
    this._currentSelection = selectionView;
  }

  _pickColor(event) {
    const colorId = parseInt(event.target.dataset.id, 10);
    this._currentSelection.pick(colorId);
  }
}
