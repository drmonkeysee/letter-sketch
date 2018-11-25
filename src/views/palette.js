import {View} from './view.js';
import {EVENTS} from '../refresh.js';
import {COMMANDS} from '../commands.js';
import {channelsToCss, COLORS} from '../models/color.js';

class ColorSelection extends View {
  constructor(id, cmd, refreshEvent, onSelected, initColor, ...args) {
    super(...args);
    this.selection = this._doc.getElementById(id);
    this.cmd = cmd;
    this.refreshEvent = refreshEvent;
    this.onSelected = onSelected;
    this.initColor = initColor;
  }

  draw() {
    this._setColor(this.initColor);
    this.selection.addEventListener('click', e => this.onSelected(this));
  }

  subscribe(notifier) {
    notifier.subscribe(this.refreshEvent, this._refreshColor.bind(this));
  }

  select() {
    this.selection.classList.add('selected');
  }

  deselect() {
    this.selection.classList.remove('selected');
  }

  pick(color) {
    this._dispatch.command(this.cmd, color);
  }

  _refreshColor(update) {
    this._setColor(update.color);
  }

  _setColor(color) {
    if (color) {
      this.selection.classList.remove('no-color');
      this.selection.style.backgroundColor = color;
    } else {
      this.selection.classList.add('no-color');
      this.selection.style.backgroundColor = null;
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
        COLORS.black, // TODO: figure out how to get initial color from brush
        ...args
      ),
      new ColorSelection(
        'background-selection',
        COMMANDS.setBackgroundColor,
        EVENTS.onBackgroundColorChanged,
        onSelectedHandler,
        null,
        ...args
      ),
      new ColorSelection(
        'fill-selection',
        COMMANDS.setFillColor,
        EVENTS.onFillColorChanged,
        onSelectedHandler,
        null,
        ...args
      )
    ];
    this._currentSelection = null;
    this._clearSelection = this._doc.getElementById('clear-selection');
  }

  draw() {
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
      selectionView.draw();
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
