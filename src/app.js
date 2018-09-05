export default {
  start: (win, doc) => {
    const canvas = doc.getElementById('sketchpad');
    if (!canvas.getContext) {
      const msg = 'No console support detected!';
      console.error(msg);
      throw new Error(msg);
    }

    console.log('started letter-sketch');

    // TODO: this includes the border so calculations off rect are slightly off
    const rect = canvas.getBoundingClientRect();
    const dpr = win.devicePixelRatio || 1;
    console.log('dpr: %d, rect: %d x, %d y', dpr, rect.width, rect.height);

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
  }
};
