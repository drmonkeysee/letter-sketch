import {View} from './view.js';
import {DEFAULT_GLYPH} from '../codepage.js';

export class GlyphRuler extends View {
  constructor(...args) {
    super(...args);
    this._ruler = this._doc.getElementById('glyph-ruler');
  }

  draw() {
    this._ruler.textContent = DEFAULT_GLYPH;
  }

  get glyphExtent() {
    const {height, width} = this._ruler.getBoundingClientRect();
    return {height, width};
  }

  get referenceGlyph() {
    return this._ruler.textContent;
  }
}
