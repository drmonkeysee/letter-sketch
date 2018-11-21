import makeNameMap from './namemap.js';
import {EVENTS, makeUpdate} from './refresh.js';
import {Color} from './models.js';

// TODO: move this somewhere else
function toColor(hexColor) {
  // chop the leading '#'
  if (hexColor.length % 2) {
    hexColor = hexColor.substring(1);
  }
  const step = 2,
        start = 0,
        offsets = hexColor.length > 7 ? [0, 1, 2, 3] : [0, 1, 2],
        channels = offsets.map(i => parseInt(hexColor.substring(start + (step * i), step + (step * i)), 16));
  return new Color(...channels);
}

class SetForegroundColor {
  constructor(models, hexColor) {
    this._brushTile = models.currentBrush.tile;
    this._hexColor = hexColor;
  }

  execute() {
    this._brushTile.foregroundColor = toColor(this._hexColor);
    return makeUpdate(EVENTS.onForegroundColorChanged, {color: this._brushTile.foregroundColor});
  }
}

export const COMMAND_REGISTRY = [
  SetForegroundColor
];

export const COMMANDS = makeNameMap(COMMAND_REGISTRY, (name, c) => Symbol(name));
