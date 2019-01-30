import namemap from './namemap.js';
import {EVENTS, makeUpdate} from './refresh.js';
import {currentStroke, currentDraw} from './models/tools.js';

// TODO: rework these classes into closures
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
  constructor(models, toolName) {
    this._models = models;
    this._toolName = toolName;
  }

  execute() {
    this._models.currentTool = toolName;
    return makeUpdate(EVENTS.onToolChanged, {stroke: currentStroke(this._models)});
  }
}

class DrawShape {
  constructor(models, shape) {
    this._brush = models.currentBrush;
    this._draw = currentDraw(models);
    this._terminal = models.terminal;
    this._shape = shape;
  }

  execute() {
    const shape = this._draw(this._shape, this._brush.cell, this._terminal);
    return makeUpdate(EVENTS.onDrawCompleted, {shape: shape, tileSize: this._brush.tileSize});
  }
}

export const COMMAND_REGISTRY = [
  SetForegroundColor,
  SetBackgroundColor,
  SetFillColor,
  SetGlyph,
  SetTool,
  DrawShape
];

export const COMMANDS = namemap(COMMAND_REGISTRY, (name, c) => Symbol(name));
