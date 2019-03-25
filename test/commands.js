import {expect} from 'chai';
import sinon from 'sinon';
import * as nmModule from '../src/namemap.js';
import {CommandDispatcher} from '../src/commands.js';

describe('CommandDispatcher', function () {
  describe('#command()', function () {
    beforeEach(function () {
      this.command = sinon.fake.returns('testNotification');
      this.bindCmd = sinon.fake.returns(this.command);
      const injectBindCmd = (r, f, n) => ({testCmd: f(n, this.bindCmd)});
      sinon.stub(nmModule, 'default').callsFake(injectBindCmd);
      this.notifier = {signal: sinon.fake()};
      this.target = new CommandDispatcher(this.notifier, 'testModels');
    });
    afterEach(function () {
      sinon.restore();
    });

    it('invokes command and signals result', function () {
      this.target.command('testCmd');

      sinon.assert.calledWith(this.bindCmd, 'testModels');
      sinon.assert.calledWith(this.command);
      sinon.assert.calledWith(this.notifier.signal, 'testNotification');
    });

    it('invokes command with arguments', function () {
      this.target.command('testCmd', 1, 2, 3);

      sinon.assert.calledWith(this.bindCmd, 'testModels', 1, 2, 3);
      sinon.assert.calledWith(this.command);
      sinon.assert.calledWith(this.notifier.signal, 'testNotification');
    });

    it('raises error if invalid command', function () {
      expect(() => this.target.command('notACommand')).to.throw('Unknown command: notACommand');
    });
  });
});
