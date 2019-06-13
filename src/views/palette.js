import {channelsToCss} from '../color.js';
import {COMMANDS} from '../commands.js';
import {EVENTS} from '../refresh.js';
import {View} from './view.js';

class ColorSelection extends View {
  constructor(id, cmd, refreshEvent, onSelected, colorInitializer, ...args) {
    super(...args);
    this._selection = this._doc.getElementById(id);
    this._cmd = cmd;
    this._refreshEvent = refreshEvent;
    this._onSelected = onSelected;
    this._colorInitializer = colorInitializer;
  }

  draw(initialState) {
    this._setColor(this._colorInitializer(initialState.colors));
    this._selection.addEventListener('click', e => this._onSelected(this));
  }

  subscribe(notifier) {
    notifier.subscribe(this._refreshEvent, this._refreshColor.bind(this));
  }

  select() {
    this._selection.classList.add('selected');
  }

  deselect() {
    this._selection.classList.remove('selected');
  }

  pick(color) {
    this._dispatch.command(this._cmd, color);
  }

  _refreshColor(update) {
    this._setColor(update.color);
  }

  _setColor(color) {
    if (color) {
      this._selection.classList.remove('no-color');
      this._selection.style.backgroundColor = color;
    } else {
      this._selection.classList.add('no-color');
      this._selection.style.backgroundColor = null;
    }
  }
}

export class ColorPalette extends View {
  constructor(...args) {
    super(...args);
    this._palette = this._doc.getElementById('palette');
    const onSelectedHandler = this._setSelection.bind(this);
    this._colorSelections = [
      new ColorSelection(
        'foreground-selection',
        COMMANDS.setForegroundColor,
        EVENTS.onForegroundColorChanged,
        onSelectedHandler,
        colors => colors.fg,
        ...args
      ),
      new ColorSelection(
        'background-selection',
        COMMANDS.setBackgroundColor,
        EVENTS.onBackgroundColorChanged,
        onSelectedHandler,
        colors => colors.bg,
        ...args
      )
    ];
    this._currentSelection = null;
    this._clearSelection = this._doc.getElementById('clear-selection');
  }

  draw(initialState) {
    const colorSteps = [0x00, 0x80, 0xff];
    for (const redStep of colorSteps) {
      const colorColumn = this._doc.createElement('div');
      this._palette.appendChild(colorColumn);
      
      for (const greenStep of colorSteps) {
        for (const blueStep of colorSteps) {
          const colorCell = this._doc.createElement('div');
          colorCell.className = 'palette-cell';
          colorCell.style.backgroundColor = channelsToCss(redStep, greenStep, blueStep);
          colorCell.addEventListener('click', this._pickColor.bind(this));
          colorColumn.appendChild(colorCell);
        }
      }
    }

    for (const selectionView of this._colorSelections) {
      selectionView.draw(initialState);
    }
    this._setSelection(this._colorSelections[0]);

    this._clearSelection.addEventListener('click', this._pickColor.bind(this));
  }

  subscribe(notifier) {
    for (const selectionView of this._colorSelections) {
      selectionView.subscribe(notifier);
    }
  }

  _setSelection(selectionView) {
    for (const selectionView of this._colorSelections) {
      selectionView.deselect();
    }
    selectionView.select();
    this._currentSelection = selectionView;
  }

  _pickColor(event) {
    this._currentSelection.pick(event.target.style.backgroundColor);
  }
}
