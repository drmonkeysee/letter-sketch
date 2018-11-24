import {CP437, DEFAULT_GLYPH} from './codepage.js';
import {EVENTS} from './refresh.js';
import {channelsToCss, colors} from './models/color.js';
import {COMMANDS} from './commands.js';

class View {
  constructor(doc, dispatch) {
    this._doc = doc;
    this._dispatch = dispatch;
  }

  subscribe(notifier) {
    // do nothing by default
  }
}

class GlyphRuler extends View {
  constructor(...args) {
    super(...args);
    this._ruler = this._doc.getElementById('glyph-ruler');
  }

  draw() {
    this._ruler.textContext = DEFAULT_GLYPH;
  }

  get glyphExtent() {
    const {height, width} = this._ruler.getBoundingClientRect();
    return {height, width};
  }

  get referenceGlyph() {
    return this._ruler.textContext;
  }
}

class LetterBlock extends View {
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

class ColorPalette extends View {
  constructor(...args) {
    super(...args);
    this._palette = this._doc.getElementById('palette');
    this._colorSelections = [
      this._doc.getElementById('foreground-selection'),
      this._doc.getElementById('background-selection'),
      this._doc.getElementById('fill-selection')
    ];
    [this._fgSelection, this._bgSelection, this._fillSelection] = this._colorSelections;
    this._currentSelection = null;
  }

  subscribe(notifier) {
    notifier.subscribe(EVENTS.onForegroundColorChanged, this._refreshColor.bind(this));
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

    // TODO: figure out how to get this from brush
    const fgColor = colors.BLACK,
          bgColor = null,
          fillColor = null;
    this._setColorSelection(this._fgSelection, fgColor);
    this._setColorSelection(this._bgSelection, bgColor);
    this._setColorSelection(this._fillSelection, fillColor);

    const handler = e => this._setCurrentSelection(e.target);
    for (const selection of this._colorSelections) {
      selection.addEventListener('click', handler);
    }
    this._setCurrentSelection(this._fgSelection);
  }

  _setCurrentSelection(targetSelection) {
    for (const selection of this._colorSelections) {
      selection.classList.remove('selected');
    }
    targetSelection.classList.add('selected');
    this._currentSelection = targetSelection;
  }

  _pickColor(event) {
    // TODO: reverse dispatch to ColorSelection view to determine fg, bg, fill
    this._dispatch.command(COMMANDS.setForegroundColor, event.target.style.backgroundColor);
  }

  _refreshColor(update) {
    this._fgSelection.style.backgroundColor = update.color;
  }

  _setColorSelection(selection, color) {
    if (color) {
      selection.classList.remove('no-color');
      selection.style.backgroundColor = color;
    } else {
      selection.classList.add('no-color');
      selection.style.backgroundColor = null;
    }
  }
}

export const VIEW_REGISTRY = [
  GlyphRuler,
  LetterBlock,
  ColorPalette
];
