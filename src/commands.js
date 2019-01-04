import namemap from './namemap.js';
import {EVENTS, makeUpdate} from './refresh.js';

class SetForegroundColor {
  constructor(models, color) {
    this._brushCell = models.currentBrush.cell;
    this._color = color;
  }

  execute() {
    this._brushCell.foregroundColor = this._color;
    return makeUpdate(EVENTS.onForegroundColorChanged, {color: this._brushCell.foregroundColor});
  }
}

class SetBackgroundColor {
  constructor(models, color) {
    this._brushCell = models.currentBrush.cell;
    this._color = color;
  }

  execute() {
    this._brushCell.backgroundColor = this._color;
    return makeUpdate(EVENTS.onBackgroundColorChanged, {color: this._brushCell.backgroundColor});
  }
}

class SetFillColor {
  constructor(models, color) {
    this._brush = models.currentBrush;
    this._color = color;
  }

  execute() {
    this._brush.fillColor = this._color;
    return makeUpdate(EVENTS.onFillColorChanged, {color: this._brush.fillColor});
  }
}

class SetGlyph {
  constructor(models, glyph) {
    this._brushCell = models.currentBrush.cell;
    this._glyph = glyph;
  }

  execute() {
    this._brushCell.glyph = this._glyph;
    return makeUpdate(EVENTS.onGlyphChanged, {glyph: this._brushCell.glyph});
  }
}

class SetTool {
  constructor(models, tool) {
    this._models = models;
    this._tool = tool;
  }

  execute() {
    this._models.currentTool = tool;
    return makeUpdate(EVENTS.onToolChanged, {stroke: this._models.currentTool.stroke});
  }
}

class DrawTerminal {
  constructor(models, shape) {
    this._brushCell = models.currentBrush.cell;
    this._drawStrategy = models.currentTool.drawStrategy;
    this._terminal = models.terminal;
    this._shape = shape;
  }

  execute() {
    // draw shape onto terminal
    // return tiles for makeUpdate
  }
}

export const COMMAND_REGISTRY = [
  SetForegroundColor,
  SetBackgroundColor,
  SetFillColor,
  SetGlyph,
  DrawTerminal
];

export const COMMANDS = namemap(COMMAND_REGISTRY, (name, c) => Symbol(name));
