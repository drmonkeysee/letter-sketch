const EVENT_NAMES = [
  'onBackgroundColorChanged',
  'onDrawCommitted',
  'onForegroundColorChanged',
  'onGlyphChanged',
  'onTerminalResized',
  'onTerminalResizeReady',
  'onTerminalResizeVerify',
  'onToolChanged',
];

export const EVENTS = Object.fromEntries(EVENT_NAMES.map(n => [n, n]));

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
