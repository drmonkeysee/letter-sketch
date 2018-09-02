class App {
  constructor(doc) {
    this.doc = doc;
    const canvas = doc.getElementById('sketchpad');
    if (!canvas.getContext) {
      const msg = 'No console support detected!';
      console.error(msg);
      throw new Error(msg);
    }
    const ctx = canvas.getContext('2d', { alpha: false });
    console.log('started letter-sketch');
  }
}

let app;

export default {
  start: function (doc) {
    app = new App(doc);
  }
};
