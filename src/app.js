export default {
  start: doc => {
    const canvas = doc.getElementById('sketchpad');
    if (!canvas.getContext) {
      const msg = 'No console support detected!';
      console.error(msg);
      throw new Error(msg);
    }

    console.log('started letter-sketch');

    const ctx = canvas.getContext('2d', { alpha: false });
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'yellow';
    ctx.fillRect(10, 10, canvas.width - 20, canvas.height - 20);
    ctx.clearRect(40, 40, canvas.width - 80, canvas.height - 80);
    ctx.font = '12px Monaco';
    ctx.fillStyle = 'red';
    ctx.fillText('Hello World!', 25, 25);
  }
};
