export function makeTile(glyph, fgColor, bgColor) {
  return {
    glyph: glyph,
    foregroundColor: fgColor,
    backgroundColor: bgColor
  };
}

export function makeBrush(tile, tileSize = null, fillColor = null) {
  return {
    tile: tile,
    tileSize: tileSize,
    fillColor: fillColor
  };
}
