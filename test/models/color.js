import {expect} from 'chai';
import {Color, cssHexToColor, colorToCssHex} from '../../src/models/color.js';

describe('Color', function () {
  describe('#staticProperties', function () {
    it('exposes white constant', function () {
      const c = Color.WHITE;
      
      expect(c.r).to.equal(0xff);
      expect(c.g).to.equal(0xff);
      expect(c.b).to.equal(0xff);
      expect(c.a).to.equal(0xff);
    });

    it('exposes black constant', function () {
      const c = Color.BLACK;
      
      expect(c.r).to.equal(0x00);
      expect(c.g).to.equal(0x00);
      expect(c.b).to.equal(0x00);
      expect(c.a).to.equal(0xff);
    });
  });
  
  describe('#ctor()', function () {
    it('sets rgb', function () {
      const r = 0x44, g = 0x30, b = 0xab;
      
      const c = new Color(r, g, b);

      expect(c.r).to.equal(r);
      expect(c.g).to.equal(g);
      expect(c.b).to.equal(b);
      expect(c.a).to.equal(0xff);
    });

    it('sets rgba', function () {
      const r = 0x44, g = 0x30,
            b = 0xab, a = 0x78;

      const c = new Color(r, g, b, a);

      expect(c.r).to.equal(r);
      expect(c.g).to.equal(g);
      expect(c.b).to.equal(b);
      expect(c.a).to.equal(a);
    });

    it('clamps invalid values', function () {
      const r = -20, g = 256,
            b = -1, a = 1024;
      
      const c = new Color(r, g, b, a);

      expect(c.r).to.equal(0x00);
      expect(c.g).to.equal(0xff);
      expect(c.b).to.equal(0x00);
      expect(c.a).to.equal(0xff);
    });

    it('handles undefined arguments', function () {
      const c = new Color();

      expect(c.r).to.equal(0x00);
      expect(c.g).to.equal(0x00);
      expect(c.b).to.equal(0x00);
      expect(c.a).to.equal(0xff);
    });

    it('handles NaN arguments', function () {
      const c = new Color(NaN, NaN, NaN, NaN);

      expect(c.r).to.equal(0x00);
      expect(c.g).to.equal(0x00);
      expect(c.b).to.equal(0x00);
      expect(c.a).to.equal(0x00);
    });
  });
});

describe('#cssHexToColor()', function () {
  it('parses rgb css hex string', function () {
    const s = '#23ab45';
    
    const c = cssHexToColor(s);

    expect(c.r).to.equal(0x23);
    expect(c.g).to.equal(0xab);
    expect(c.b).to.equal(0x45);
    expect(c.a).to.equal(0xff);
  });

  it('parses rgb missing leading hash', function () {
    const s = '23ab45';
    
    const c = cssHexToColor(s);

    expect(c.r).to.equal(0x23);
    expect(c.g).to.equal(0xab);
    expect(c.b).to.equal(0x45);
    expect(c.a).to.equal(0xff);
  });

  it('parses rgba css hex string', function () {
    const s = '#23ab45bc';
    
    const c = cssHexToColor(s);

    expect(c.r).to.equal(0x23);
    expect(c.g).to.equal(0xab);
    expect(c.b).to.equal(0x45);
    expect(c.a).to.equal(0xbc);
  });

  it('parses rgba missing leading hash', function () {
    const s = '23ab45bc';
    
    const c = cssHexToColor(s);

    expect(c.r).to.equal(0x23);
    expect(c.g).to.equal(0xab);
    expect(c.b).to.equal(0x45);
    expect(c.a).to.equal(0xbc);
  });

  it('parses short rgb css hex string', function () {
    const s = '#2a4';
    
    const c = cssHexToColor(s);

    expect(c.r).to.equal(0x22);
    expect(c.g).to.equal(0xaa);
    expect(c.b).to.equal(0x44);
    expect(c.a).to.equal(0xff);
  });

  it('parses short rgb missing leading hash', function () {
    const s = '2a4';
    
    const c = cssHexToColor(s);

    expect(c.r).to.equal(0x22);
    expect(c.g).to.equal(0xaa);
    expect(c.b).to.equal(0x44);
    expect(c.a).to.equal(0xff);
  });

  it('parses short rgba css hex string', function () {
    const s = '#2a4b';
    
    const c = cssHexToColor(s);

    expect(c.r).to.equal(0x22);
    expect(c.g).to.equal(0xaa);
    expect(c.b).to.equal(0x44);
    expect(c.a).to.equal(0xbb);
  });

  it('parses short rgba missing leading hash', function () {
    const s = '2a4b';
    
    const c = cssHexToColor(s);

    expect(c.r).to.equal(0x22);
    expect(c.g).to.equal(0xaa);
    expect(c.b).to.equal(0x44);
    expect(c.a).to.equal(0xbb);
  });

  it('parses empty string', function () {
    const s = '';
    
    const c = cssHexToColor(s);

    expect(c.r).to.equal(0x00);
    expect(c.g).to.equal(0x00);
    expect(c.b).to.equal(0x00);
    expect(c.a).to.equal(0xff);
  });

  it('parses invalid string', function () {
    const s = 'this is not a number';
    
    const c = cssHexToColor(s);

    expect(c.r).to.equal(0x00);
    expect(c.g).to.equal(0x00);
    expect(c.b).to.equal(0x00);
    expect(c.a).to.equal(0x00);
  });

  it('ignores extra characters', function () {
    const s = '#23ab45bc123456';
    
    const c = cssHexToColor(s);

    expect(c.r).to.equal(0x23);
    expect(c.g).to.equal(0xab);
    expect(c.b).to.equal(0x45);
    expect(c.a).to.equal(0xbc);
  });
});

describe('#colorToCssHex()', function () {
});
