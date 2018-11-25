import makeNameMap from './namemap.js';
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

export const COMMAND_REGISTRY = [
  SetForegroundColor,
  SetBackgroundColor,
  SetFillColor
];

export const COMMANDS = makeNameMap(COMMAND_REGISTRY, (name, c) => Symbol(name));
