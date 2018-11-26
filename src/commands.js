import namemap from './namemap.js';
import {EVENTS, makeUpdate} from './refresh.js';

class SetForegroundColor {
  constructor(models, color) {
    this._brushTile = models.currentBrush.tile;
    this._color = color;
  }

  execute() {
    this._brushTile.foregroundColor = this._color;
    return makeUpdate(EVENTS.onForegroundColorChanged, {color: this._brushTile.foregroundColor});
  }
}

class SetBackgroundColor {
  constructor(models, color) {
    this._brushTile = models.currentBrush.tile;
    this._color = color;
  }

  execute() {
    this._brushTile.backgroundColor = this._color;
    return makeUpdate(EVENTS.onBackgroundColorChanged, {color: this._brushTile.backgroundColor});
  }
}

class SetFillColor {
  constructor(models, color) {
    this._brush = models.currentBrush;
    this._color = color;
  }

  execute() {
    this._brush.fillColor = this._color;
    return makeUpdate(EVENTS.onFillColorChanged, {color: this._brush.fillColor});
  }
}

class SetGlyph {
  constructor(models, glyph) {
    this._brushTile = models.currentBrush.tile;
    this._glyph = glyph;
  }

  execute() {
    this._brushTile.glyph = this._glyph;
    return makeUpdate(EVENTS.onGlyphChanged, {glyph: this._brushTile.glyph});
  }
}

export const COMMAND_REGISTRY = [
  SetForegroundColor,
  SetBackgroundColor,
  SetFillColor,
  SetGlyph
];

export const COMMANDS = namemap(COMMAND_REGISTRY, (name, c) => Symbol(name));
