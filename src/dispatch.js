import makeNameMap from './namemap.js';
import {COMMAND_REGISTRY, COMMANDS} from './commands.js';

class CommandDispatcher {
  constructor(notifier, models) {
    this._notifier = notifier;
    this._bindCommands(models);
  }

  command(name, ...args) {
    const cmdCls = this._commands[name];
    if (!cmdCls) {
      throw new Error(`Unknown command: ${name.toString()}`);
    }
    const cmd = new cmdCls(...args),
          update = cmd.execute();
    this._notifier.signal(update);
  }

  _bindCommands(models) {
    // create cmd factory per class that captures models for command ctor binding
    this._commands = makeNameMap(
      COMMAND_REGISTRY,
      (n, cmdCls) => (...args) => new cmdCls(models, ...args),
      name => COMMANDS[name]
    );
  }
}

export default function (notifier, models) {
  return new CommandDispatcher(notifier, models);
};
