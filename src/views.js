import {CP437, DEFAULT_GLYPH} from './codepage.js';
// TODO: temporary import to get display working
import {Color} from './models.js';

class View {
  constructor(doc) {
    this._doc = doc;
  }
}

class GlyphRuler extends View {
  constructor(doc) {
    super(doc);
    this._ruler = doc.getElementById('glyph-ruler');
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
  constructor(doc) {
    super(doc);
    this._block = doc.getElementById('letter-block');
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
  constructor(doc) {
    super(doc);
    this._colorSteps = [0x00, 0x80, 0xff];
    this._palette = doc.getElementById('palette');
    this._colorSelections = [
      doc.getElementById('foreground-selection'),
      doc.getElementById('background-selection'),
      doc.getElementById('fill-selection')
    ];
    [this._fgSelection, this._bgSelection, this._fillSelection] = this._colorSelections;
  }

  draw() {
    for (const redStep of this._colorSteps) {
      const colorColumn = this._doc.createElement('div');
      this._palette.appendChild(colorColumn);
      
      for (const greenStep of this._colorSteps) {
        for (const blueStep of this._colorSteps) {
          const colorCell = this._doc.createElement('div');
          colorCell.className = 'palette-cell';
          const cssColor = this._cssHexColor(redStep, greenStep, blueStep);
          colorCell.style.backgroundColor = cssColor;
          colorCell.dataset.hexColor = cssColor;
          colorCell.addEventListener('click', this._pickColor);
          colorColumn.appendChild(colorCell);
        }
      }
    }

    // TODO: figure out how to get this from brush
    const fgColor = Color.BLACK,
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
  }

  _pickColor(event) {
    console.log('picked color %o', event);
  }

  _setColorSelection(selection, color) {
    if (color) {
      selection.classList.remove('no-color');
      selection.style.backgroundColor = this._cssHexColor(color.r, color.g, color.b);
    } else {
      selection.classList.add('no-color');
      selection.style.backgroundColor = null;
    }
  }

  _cssHexColor(r, g, b) {
    return `#${this._byteHex(r)}${this._byteHex(g)}${this._byteHex(b)}`;
  }

  _byteHex(n) {
    const s = n.toString(16);
    return n < 0x10 ? `0${s}` : s;
  }
}

export default function () {
  return [
    GlyphRuler,
    LetterBlock,
    ColorPalette
  ];
};
