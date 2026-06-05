export const EVENTS = Object.fromEntries([
  'onBackgroundColorChanged',
  'onDrawCommitted',
  'onForegroundColorChanged',
  'onGlyphChanged',
  'onRedo',
  'onTerminalCleared',
  'onTerminalResized',
  'onTerminalResizeReady',
  'onTerminalResizeVerify',
  'onTextCursorActive',
  'onToolChanged',
  'onUndo',
].map(n => [n, n]));

export class ViewNotifier {
  constructor() {
    this._notifications = {};
  }

  register(...views) {
    for (const view of views) {
      view.subscribe(this);
    }
  }

  subscribe(events, handler) {
    events = [].concat(events);
    for (const event of events) {
      let notification = this._notifications[event];
      if (!notification) {
        this._notifications[event] = notification = [];
      }
      notification.push(handler);
    }
  }

  signal(update) {
    const notification = this._notifications[update.event];
    if (!notification) return;

    for (const handler of notification) {
      handler(update);
    }
  }
}
