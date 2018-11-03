import {CP437, DEFAULT_GLYPH} from './codepage.js';

class View {
  constructor(doc) {
    this.doc = doc;
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

export default function () {
  return [GlyphRuler];
};
