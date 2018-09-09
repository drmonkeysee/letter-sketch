export default {
  start: win => {
    const doc = window.document;
    const canvas = doc.getElementById('sketchpad');
    if (!canvas.getContext) {
      const msg = 'No console support detected!';
      console.error(msg);
      throw new Error(msg);
    }

    console.log('started letter-sketch');

    const rect = canvas.getBoundingClientRect();
    const dpr = win.devicePixelRatio || 1;
    console.log('dpr: %d, rect: %d x, %d y', dpr, rect.width, rect.height);
    console.log('canvas %d w %d h', canvas.width, canvas.height);

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d', { alpha: false });
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = 'yellow';
    console.log('fill rect %d w %d h', rect.width - 20, rect.height - 20);
    ctx.fillRect(10, 10, rect.width - 20, rect.height - 20);
    ctx.clearRect(40, 40, rect.width - 80, rect.height - 80);
    
    const bodyStyle = window.getComputedStyle(document.getElementsByTagName('body')[0]);
    const fontStyle = `${bodyStyle.getPropertyValue('font-size')} ${bodyStyle.getPropertyValue('font-family')}`;
    ctx.font = fontStyle;
    ctx.fillStyle = 'red';
    ctx.fillText('Hello World!', 25, 25);
    
    const letters = ['A', 'a', 'W', '1'];
    for (const letter of letters) {
      console.log('ctx %s dimensions %o', letter, ctx.measureText(letter));
    }

    const textRuler = document.getElementById('text-ruler');
    for (const letter of letters) {
      textRuler.textContent = letter;
      console.log('%s dimensions cw %d ch %d %o', letter, textRuler.clientWidth, textRuler.clientHeight, textRuler.getBoundingClientRect());  
    }
  }
};
