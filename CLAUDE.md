# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See @README.md for project overview and @package.json for project commands.

## Commands

Run a single test file: `npx mocha test/some.test.js`

## Architecture

Letter Sketch is an in-browser ASCII art editor (CP437 character set, 16-color palette) built as a static web app. Parcel bundles ES6 modules from `index.html` as the entry point.

### Data Flow

Commands → Models → ViewNotifier signals → Views re-render

- **`src/app.js`** — orchestrator; wires models, commands, views, and subscriptions on startup
- **`src/commands.js`** — `CommandDispatcher` is the central command bus; all state mutations go through commands
- **`src/refresh.js`** — `ViewNotifier` pub/sub system; views subscribe to named events and re-render on signal

### Models (`src/models/`)

- **`Terminal`** — core grid: a linear array of `Cell`s indexed by `x + (y * stride)`; resizable
- **`Cell`** — unit of the grid: `glyphId`, `fgColorId`, `bgColorId`
- **`storage.js`** — initializes and exports the shared model instances (terminal, tool state, cell properties)

### Views (`src/views/`)

Views are plain classes wrapping DOM elements. They subscribe to `ViewNotifier` events and re-render themselves. No framework — direct DOM manipulation via `innerHTML` and `classList`.

### Tools (`src/tools.js`, `src/gestures.js`, `src/figures.js`)

Three-layer composition:

1. **Tool** — named entry point; owns gesture + figure configuration
2. **Gesture** (`MouseGesture`, `CursorGesture`, `SampleCell`) — handles input events, tracks drag state
3. **Figure** — pure function returning an array of `{x, y, cell}` tiles to paint

Adding a new tool means defining a figure function, pairing it with a gesture, and registering a tool entry.

### Character / Color Data

- **`src/codepage.js`** — CP437 glyph table (256 entries) with sigil constants (e.g., `CLEAR` used by eraser)
- **`src/palette.js`** — 16-color basic palette
- **`src/boxchars.js`** — box-drawing character selection logic for the Box Draw tool

### No persistence

All state is in-memory. There is no localStorage, IndexedDB, or server backing.
