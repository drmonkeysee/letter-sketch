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

export const COMMAND_REGISTRY = [
  SetForegroundColor
];

export const COMMANDS = makeNameMap(COMMAND_REGISTRY, (name, c) => Symbol(name));
