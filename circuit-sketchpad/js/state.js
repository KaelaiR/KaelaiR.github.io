/* ==========================================================
   state.js - the app's data, undo history and saving
   ----------------------------------------------------------
   The whole drawing is one object:
     drawing = { items: [...], nextId: 1 }
   Each item is either
     a wire: { type:'wire', id, a:[x,y], b:[x,y] }
     a part: { type:'R'|'C'|..., id, x, y, rotation, value }
   ========================================================== */

let drawing = loadDrawing();
let undoStack = [];

// Things that describe what the user is doing right now
let tool = 'select';     // 'select', 'wire', or a key of PARTS
let selectedId = null;   // id of the selected item
let wireStart = null;    // [x, y] while a wire is being drawn
let cursor = [0, 0];     // mouse position snapped to the grid
let ghostRotation = 0;   // rotation of the part preview before placing
let drag = null;         // info while dragging a part

// ---------- Helpers ----------
const snapToGrid = v => Math.round(v / GRID) * GRID;
const findItem = id => drawing.items.find(i => i.id === id);

// ---------- Saving / loading (browser storage) ----------
function loadDrawing() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && saved.items) return saved;
  } catch (e) { /* storage unavailable: start empty */ }
  return { items: [], nextId: 1 };
}

function saveDrawing() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(drawing)); } catch (e) {}
}

// ---------- Changing the drawing ----------
// Always change the drawing through this function so Undo, saving and
// redrawing happen automatically:  change(() => { drawing.items.push(...) })
function change(edit) {
  undoStack.push(JSON.stringify(drawing));
  if (undoStack.length > MAX_UNDO) undoStack.shift();
  edit();
  saveDrawing();
  updateToolbar();
  draw();
}

function undo() {
  if (!undoStack.length) return;
  drawing = JSON.parse(undoStack.pop());
  selectedId = null;
  saveDrawing();
  updateToolbar();
  draw();
}

// ---------- Geometry ----------
// Where a part's connection points are on the canvas (after rotation)
function pinsOf(part) {
  const angle = part.rotation * Math.PI / 180;
  const c = Math.round(Math.cos(angle)), s = Math.round(Math.sin(angle));
  return PARTS[part.type].pins.map(([x, y]) => [part.x + x * c - y * s, part.y + x * s + y * c]);
}
