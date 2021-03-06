import namemap from './namemap.js';

const EVENT_NAMES = [
  'onBackgroundColorChanged',
  'onDrawCommitted',
  'onForegroundColorChanged',
  'onGlyphChanged',
  'onLineModeChanged',
  'onTerminalResized',
  'onTerminalResizeReady',
  'onTerminalResizeVerify',
  'onToolChanged',
];

export const EVENTS = namemap(EVENT_NAMES, (name, e) => name);

export class ViewNotifier {
  constructor() {
    this._notifications = {};
  }

  register(...views) {
    for (const view of views) {
      view.subscribe(this);
    }
  }

  subscribe(event, handler) {
    let notification = this._notifications[event];
    if (!notification) {
      this._notifications[event] = notification = [];
    }
    notification.push(handler);
  }

  signal(update) {
    const notification = this._notifications[update.event];
    if (!notification) return;

    for (const handler of notification) {
      handler(update);
    }
  }
}
