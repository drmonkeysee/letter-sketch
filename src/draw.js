export function drawShape(shape, brushCell, terminal) {
  for (const tile of shape) {
    terminal.updateCell(tile.x, tile.y, tile.cell);
  }
  return shape;
}
