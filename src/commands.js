class SetForegroundColor {
  constructor(brushTile) {
    this.brushTile = brushTile;
  }

  execute(color) {
    console.log('set fg color: %o', color);
    //this.brushTile.foregroundColor = color;
  }
}

const CMD_REGISTRY = [
  SetForegroundColor
];

export class CommandDispatcher {
  constructor() {
    this._commands = {};
  }

  createCommands(brush) {
    // TODO: abstract ClassMap idea
    for (const cmdClass of CMD_REGISTRY) {
      let name = cmdClass.name;
      name = name.replace(name[0], name[0].toLowerCase());
      // TODO: generalize arguments to cmd creation
      this._commands[name] = new cmdClass(brush.tile);
    }
  }

  dispatch(command, ...args) {
    const cmd = this._commands[command];
    if (cmd) {
      cmd.execute(...args);
    } else {
      throw new Error(`Unknown command: ${command}`);
    }
  }
}
