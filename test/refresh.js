import sinon from 'sinon';
import {ViewNotifier, EVENTS} from '../src/refresh.js';

describe('ViewNotifier', function () {
  beforeEach(function () {
    this.target = new ViewNotifier();
  });
  afterEach(function() {
    sinon.restore();
  });
  
  describe('#register()', function () {
    it('registers single view', function () {
      const view = {subscribe: sinon.fake()};

      this.target.register(view);

      sinon.assert.calledWith(view.subscribe, this.target);
    });

    it('registers multiple views', function () {
      const views = [
        {subscribe: sinon.fake()},
        {subscribe: sinon.fake()},
        {subscribe: sinon.fake()}
      ];

      this.target.register(...views);

      views.forEach(v => sinon.assert.calledWith(v.subscribe, this.target));
    });
  });

  describe('subscribing', function () {
    beforeEach(function () {
      this.update = {
        event: EVENTS.onForegroundColorChanged,
        data: 'foo'
      };
    });

    it('notifies single handler', function () {
      const handler = sinon.fake();

      this.target.subscribe(EVENTS.onForegroundColorChanged, handler);
      this.target.signal(this.update);

      sinon.assert.calledWith(handler, this.update);
    });

    it('notifies multiple handlers', function () {
      const handlers = [sinon.fake(), sinon.fake(), sinon.fake()];

      handlers.forEach(h => this.target.subscribe(EVENTS.onForegroundColorChanged, h));
      this.target.signal(this.update);

      handlers.forEach(h => sinon.assert.calledWith(h, this.update));
    });

    it('does not notify handler for different event', function () {
      const handler = sinon.fake();

      this.target.subscribe(EVENTS.onGlyphChanged, handler);
      this.target.signal(this.update);

      sinon.assert.notCalled(handler);
    });

    it('notifies only handlers for target event', function () {
      const handlers = [sinon.fake(), sinon.fake(), sinon.fake(), sinon.fake()],
            events = [
              EVENTS.onForegroundColorChanged,
              EVENTS.onGlyphChanged,
              EVENTS.onGlyphChanged,
              EVENTS.onForegroundColorChanged
            ];

      handlers.forEach((h, i) => this.target.subscribe(events[i], h));
      this.target.signal(this.update);

      handlers.forEach((h, i) => {
        if (events[i] == EVENTS.onForegroundColorChanged) {
          sinon.assert.calledWith(h, this.update);
        } else {
          sinon.assert.notCalled(h);
        }
      });
    });
  });
});
