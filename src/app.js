const cp437 = [
  '\u0000', '\u263a', '\u263b', '\u2665', '\u2666', '\u2663', '\u2660', '\u2022', '\u25d8', '\u25cb', '\u25d9', '\u2642', '\u2640', '\u266a', '\u266b', '\u263c',
  '\u25ba', '\u25c4', '\u2195', '\u203c', '\u00b6', '\u00a7', '\u25ac', '\u21a8', '\u2191', '\u2193', '\u2192', '\u2190', '\u221f', '\u2194', '\u25b2', '\u25bc',
  '\u0020', '\u0021', '\u0022', '\u0023', '\u0024', '\u0025', '\u0026', '\u0027', '\u0028', '\u0029', '\u002a', '\u002b', '\u002c', '\u002d', '\u002e', '\u002f',
  '\u0030', '\u0031', '\u0032', '\u0033', '\u0034', '\u0035', '\u0036', '\u0037', '\u0038', '\u0039', '\u003a', '\u003b', '\u003c', '\u003d', '\u003e', '\u003f',
  '\u0040', '\u0041', '\u0042', '\u0043', '\u0044', '\u0045', '\u0046', '\u0047', '\u0048', '\u0049', '\u004a', '\u004b', '\u004c', '\u004d', '\u004e', '\u004f',
  '\u0050', '\u0051', '\u0052', '\u0053', '\u0054', '\u0055', '\u0056', '\u0057', '\u0058', '\u0059', '\u005a', '\u005b', '\u005c', '\u005d', '\u005e', '\u005f',
  '\u0060', '\u0061', '\u0062', '\u0063', '\u0064', '\u0065', '\u0066', '\u0067', '\u0068', '\u0069', '\u006a', '\u006b', '\u006c', '\u006d', '\u006e', '\u006f',
  '\u0070', '\u0071', '\u0072', '\u0073', '\u0074', '\u0075', '\u0076', '\u0077', '\u0078', '\u0079', '\u007a', '\u007b', '\u007c', '\u007d', '\u007e', '\u2302',
  '\u00c7', '\u00fc', '\u00e9', '\u00e2', '\u00e4', '\u00e0', '\u00e5', '\u00e7', '\u00ea', '\u00eb', '\u00e8', '\u00ef', '\u00ee', '\u00ec', '\u00c4', '\u00c5',
  '\u00c9', '\u00e6', '\u00c6', '\u00f4', '\u00f6', '\u00f2', '\u00fb', '\u00f9', '\u00ff', '\u00d6', '\u00dc', '\u00a2', '\u00a3', '\u00a5', '\u20a7', '\u0192',
  '\u00e1', '\u00ed', '\u00f3', '\u00fa', '\u00f1', '\u00d1', '\u00aa', '\u00ba', '\u00bf', '\u2310', '\u00ac', '\u00bd', '\u00bc', '\u00a1', '\u00ab', '\u00bb',
  '\u2591', '\u2592', '\u2593', '\u2502', '\u2524', '\u2561', '\u2562', '\u2556', '\u2555', '\u2563', '\u2551', '\u2557', '\u255d', '\u255c', '\u255b', '\u2510',
  '\u2514', '\u2534', '\u252c', '\u251c', '\u2500', '\u253c', '\u255e', '\u255f', '\u255a', '\u2554', '\u2569', '\u2566', '\u2560', '\u2550', '\u256c', '\u2567',
  '\u2568', '\u2564', '\u2565', '\u2559', '\u2558', '\u2552', '\u2553', '\u256b', '\u256a', '\u2518', '\u250c', '\u2588', '\u2584', '\u258c', '\u2590', '\u2580',
  '\u03b1', '\u00df', '\u0393', '\u03c0', '\u03a3', '\u03c3', '\u00b5', '\u03c4', '\u03a6', '\u0398', '\u03a9', '\u03b4', '\u221e', '\u03c6', '\u03b5', '\u2229',
  '\u2261', '\u00b1', '\u2265', '\u2264', '\u2320', '\u2321', '\u00f7', '\u2248', '\u00b0', '\u2219', '\u00b7', '\u221a', '\u207f', '\u00b2', '\u25a0', '\u00a0',
];

function buildLetterBlock(doc) {
  const letterBlock = doc.getElementById('letter-block');
  for (const letter of cp437) {
    const blockText = doc.createElement('span');
    blockText.textContent = letter;
    const blockCell = doc.createElement('div');
    blockCell.appendChild(blockText);
    letterBlock.appendChild(blockCell);
  }
}

export default {
  start(win) {
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

    // test varied glyphs
    drawRect.y += 3*drawRect.h;
    console.log('draw rect: %o', drawRect);
    const weirdLetters = ['►', '↑', '←', '▼', '╩', '╗']
    for (let i = 0; i < blLength; ++i) {
      const xOffset = drawRect.x + (i * drawRect.w);
      ctx.strokeRect(xOffset, drawRect.y, drawRect.w, drawRect.h);
      ctx.fillText(weirdLetters[i], xOffset, drawRect.y);
    }

    buildLetterBlock(doc);
  }
};
