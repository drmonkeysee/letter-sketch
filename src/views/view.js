export class View {
  constructor(doc, dispatch) {
    this._doc = doc;
    this._dispatch = dispatch;
  }

  subscribe(notifier) {
    // do nothing by default
  }
}
