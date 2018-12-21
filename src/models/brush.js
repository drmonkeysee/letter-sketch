import {COLORS} from './color.js';
import {DEFAULT_GLYPH} from '../codepage.js';

export function makeTile(glyph, fgColor, bgColor) {
  return {
    glyph: glyph,
    foregroundColor: fgColor,
    backgroundColor: bgColor
  };
}

export function makeBrush(tile = makeTile(DEFAULT_GLYPH, COLORS.black, null), tileSize = null, fillColor = null) {
  return {
    tile: tile,
    tileSize: tileSize,
    fillColor: fillColor
  };
}