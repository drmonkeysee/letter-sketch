import '@babel/polyfill';  // TODO: check parcel for useBuiltIns: usage support

import app from './app.js';

global.lettersketch = app();
