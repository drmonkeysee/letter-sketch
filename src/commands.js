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
    this.brushTile = models.currentBrush.tile;
    this.hexColor = hexColor;
  }

  execute() {
    this.brushTile.foregroundColor = toColor(this.hexColor);
    return makeUpdate(EVENTS.onForegroundColorChanged, {color: this.brushTile.foregroundColor});
  }
}

const CMD_REGISTRY = [
  SetForegroundColor
];

export class CommandDispatcher {
  constructor(notifier) {
    this.notifier = notifier;
  }

  bindCommands(models) {
    // TODO: abstract this into a ClassMap?
    this._commands = CMD_REGISTRY.reduce(
      (cmds, cls) => {
        let name = cls.name;
        name = name.replace(name[0], name[0].toLowerCase());
        // create cmd factory per class that captures models for ctor binding
        cmds[name] = (...args) => new cls(models, ...args);
        return cmds;
      }, {}
    );
  }

  command(name, ...args) {
    const cmdCls = this._commands[name];
    if (!cmdCls) {
      throw new Error(`Unknown command: ${name}`);
    }
    const cmd = new cmdCls(...args),
          update = cmd.execute();
    this.notifier.signal(update);
  }
}
