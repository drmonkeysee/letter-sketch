export function drawShape(shape, brushCell, terminal) {
  for (const tile of shape) {
    terminal.updateCell(tile.x, tile.y, tile.cell);
  }
}

export function floodFill(shape, brushCell, terminal) {
  // starting at tile of shape[0] execute a floodfill
  // and return new shape
}
