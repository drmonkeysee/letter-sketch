import makeNameMap from './namemap.js';
import {EVENTS, makeUpdate} from './refresh.js';
import {cssHexToColor} from './models/color.js';

class SetForegroundColor {
  constructor(models, hexColor) {
    this._brushTile = models.currentBrush.tile;
    this._hexColor = hexColor;
  }

  execute() {
    this._brushTile.foregroundColor = cssHexToColor(this._hexColor);
    return makeUpdate(EVENTS.onForegroundColorChanged, {color: this._brushTile.foregroundColor});
  }
}

export const COMMAND_REGISTRY = [
  SetForegroundColor
];

export const COMMANDS = makeNameMap(COMMAND_REGISTRY, (name, c) => Symbol(name));
