import {EVENTS} from '../refresh.js';

export class View {
  constructor(doc, dispatch) {
    this.doc = doc;
    this.dispatch = dispatch;
  }
}

export function keyHandlerMixin(view, notifier, handler) {
  view.suppressKeyHandler = false;
  view.doc.addEventListener('keyup', handler);
  notifier.subscribe(EVENTS.onTextCursorActive, () => view.suppressKeyHandler = true);
  notifier.subscribe(EVENTS.onDrawCommitted, () => view.suppressKeyHandler = false);
}
