const EVENT_NAMES = [
  'onForegroundColorChanged'
];

export const EVENTS = EVENT_NAMES.reduce(
  (obj, name) => {
    obj[name] = Symbol(name);
    return obj;
  }, {}
);

export function makeUpdate(event, data) {
  return {event: event, ...data};
}

export class ViewNotifier {
  constructor() {
    // TODO: defaultdict-like
    this._notifications = {};
  }

  register(views) {
    for (const view of views) {
      view.subscribe(this);
    }
  }

  subscribe(event, handler) {
    if (!this._notifications[event]) {
      this._notifications[event] = []
    }
    this._notifications[event].push(handler);
  }

  signal(update) {
    const notification = this._notifications[update.event];
    if (!notification) return;

    for (const handler of notification) {
      handler(update);
    }
  }
}
