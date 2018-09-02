import SketchPad from './sketchpad.js';

global.lettersketch = {
  start: function (document) {
    const sp = new SketchPad(document.getElementById('sketchpad'));
  }
};
