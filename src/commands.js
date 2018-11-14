class SetForegroundColor {
  constructor(dispatcher, hexColor) {
    this.brushTile = dispatcher.models.currentBrush.tile;
    this.hexColor = hexColor;
  }

  execute() {
    console.log('set fg color: %o', this.hexColor);
    //this.brushTile.foregroundColor = CONVERT this.hexColor;
  }
}

const CMD_REGISTRY = [
  SetForegroundColor
];

export class CommandDispatcher {
  constructor() {
    // TODO: abstract this into a ClassMap
    this._commands = CMD_REGISTRY.reduce(
      (cmds, cls) => {
        let name = cls.name;
        name = name.replace(name[0], name[0].toLowerCase());
        cmds[name] = cls;
        return cmds;
      },
      {}
    )
  }

  command(name, ...args) {
    const cmdCls = this._commands[name];
    if (cmdCls) {
      const cmd = new cmdCls(this, ...args);
      cmd.execute();
    } else {
      throw new Error(`Unknown command: ${name}`);
    }
  }
}
