export default {
  start: win => {
    const doc = win.document;
    const canvas = doc.getElementById('sketchpad');
    if (!canvas.getContext) {
      const msg = 'No console support detected!';
      console.error(msg);
      throw new Error(msg);
    }

    console.log('started letter-sketch');

    const rect = canvas.getBoundingClientRect();
    const dpr = win.devicePixelRatio || 1;
    console.log('dpr: %d, rect: %o', dpr, rect.width, rect.height);
    console.log('canvas %d w %d h', canvas.width, canvas.height);

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d', {alpha: false});
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);
    
    const bodyStyle = win.getComputedStyle(doc.getElementsByTagName('body')[0]);
    const fontStyle = `${bodyStyle.getPropertyValue('font-size')} ${bodyStyle.getPropertyValue('font-family')}`;
    ctx.font = fontStyle;
    ctx.fillStyle = 'red';
    ctx.fillText('Hello World!', 25, 25);
    
    const letters = ['A', 'a', 'W', '1', 'y', '@'];
    for (const letter of letters) {
      console.log('ctx %s dimensions %o', letter, ctx.measureText(letter));
    }

    let glyphDims;
    const textRuler = doc.getElementById('text-ruler');
    for (const letter of letters) {
      textRuler.textContent = letter;
      glyphDims = textRuler.getBoundingClientRect();
      console.log('%s dimensions cw %d ch %d %o', letter, textRuler.clientWidth, textRuler.clientHeight, glyphDims);  
    }

    const baseLines = ['alphabetic', 'bottom', 'hanging', 'ideographic', 'middle', 'top'];
    const drawRect = {x: 60, y: 60, w: glyphDims.width, h: glyphDims.height};
    console.log('draw rect: %o', drawRect);
    ctx.strokeStyle = '#5a5a5a';
    ctx.fillStyle = 'blue';
    const blLength = baseLines.length;

    // test baselines (top places the best)
    for (let i = 0; i < blLength; ++i) {
      const xOffset = drawRect.x + (i * drawRect.w);
      ctx.strokeRect(xOffset, drawRect.y, drawRect.w, drawRect.h);
      ctx.textBaseline = baseLines[i];
      ctx.fillText('y', xOffset, drawRect.y);
    }
    
    // test varied glyphs
    drawRect.y += drawRect.h;
    console.log('draw rect: %o', drawRect);
    ctx.textBaseline = 'top';
    for (let i = 0; i < blLength; ++i) {
      const xOffset = drawRect.x + (i * drawRect.w);
      ctx.strokeRect(xOffset, drawRect.y, drawRect.w, drawRect.h);
      ctx.fillText(letters[i], xOffset, drawRect.y);
    }

    // compare to rendered as single string
    drawRect.y += drawRect.h;
    console.log('draw rect: %o', drawRect);
    for (let i = 0; i < blLength; ++i) {
      const xOffset = drawRect.x + (i * drawRect.w);
      ctx.strokeRect(xOffset, drawRect.y, drawRect.w, drawRect.h);
    }
    ctx.fillText(letters.join(''), drawRect.x, drawRect.y);

    // test round-down width
    const rdRect = Object.assign({}, drawRect);
    rdRect.y += rdRect.h;
    rdRect.w = Math.floor(rdRect.w);
    console.log('draw rect: %o', rdRect);
    ctx.textBaseline = 'top';
    for (let i = 0; i < blLength; ++i) {
      const xOffset = rdRect.x + (i * rdRect.w);
      ctx.strokeRect(xOffset, rdRect.y, rdRect.w, rdRect.h);
      ctx.fillText(letters[i], xOffset, rdRect.y);
    }

    // test round-up width
    const ruRect = Object.assign({}, drawRect);
    ruRect.y += 2 * ruRect.h;
    ruRect.w = Math.ceil(ruRect.w);
    console.log('draw rect: %o', ruRect);
    ctx.textBaseline = 'top';
    for (let i = 0; i < blLength; ++i) {
      const xOffset = ruRect.x + (i * ruRect.w);
      ctx.strokeRect(xOffset, ruRect.y, ruRect.w, ruRect.h);
      ctx.fillText(letters[i], xOffset, ruRect.y);
    }
  }
};
