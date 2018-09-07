export default {
  start: (win, doc) => {
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
    
    ctx.font = '12px Monaco';
    ctx.fillStyle = 'red';
    ctx.fillText('Hello World!', 25, 25);
    console.log('ctx A dimensions %o', ctx.measureText('A'));
    console.log('ctx a dimensions %o', ctx.measureText('a'));
    console.log('ctx W dimensions %o', ctx.measureText('W'));
    console.log('ctx y dimensions %o', ctx.measureText('y'));

    const textRuler = document.getElementById('text-ruler');
    textRuler.textContent = 'A';
    console.log('A dimensions %o', textRuler.getBoundingClientRect());
    textRuler.textContent = 'a';
    console.log('a dimensions %o', textRuler.getBoundingClientRect());
    textRuler.textContent = 'W';
    console.log('W dimensions %o', textRuler.getBoundingClientRect());
    textRuler.textContent = 'y';
    console.log('y dimensions %o', textRuler.getBoundingClientRect());
  }
};
