import {expect} from 'chai';
import {Color} from '../../src/models/color.js';

describe('Color', function () {

  describe('#ctor()', function () {

    it('exposes white constant', function () {
      const c = Color.WHITE;
      
      expect(c.r).to.equal(0xff);
      expect(c.g).to.equal(0xff);
      expect(c.b).to.equal(0xff);
      expect(c.a).to.equal(0xff);
    });

  });

});
