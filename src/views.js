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
    this._fgSelection = doc.getElementById('foreground-selection');
    this._bgSelection = doc.getElementById('background-selection');
    this._fillSelection = doc.getElementById('fill-selection');
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

  _byteHex(n) {
    const s = n.toString(16);
    return n < 0x10 ? `0${s}` : s;
  }

  _cssHexColor(r, g, b) {
    return `#${this._byteHex(r)}${this._byteHex(g)}${this._byteHex(b)}`;
  }
}

export default function () {
  return [
    GlyphRuler,
    LetterBlock,
    ColorPalette
  ];
};
