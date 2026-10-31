/* ==========================================================
   tools.js - everything the user does: toolbar, mouse, keyboard
   Edit this file to change behaviour or add new tools.
   ========================================================== */

// ---------- Toolbar ----------
// Each entry: [tool id, label, shortcut key, icon path]
const TOOL_LIST = [
  ['select', 'Select', 'V', 'M-8-14L-8 12L-2 6L4 16L8 14L2 4L10 4Z'],
  ['wire',   'Wire',   'W', 'M-30 10H0V-10H30'],
  // One button per part in the parts library (config.js)
  ...Object.entries(PARTS).map(([id, p]) => [id, p.name, p.key, p.shape])
];

function buildToolRail() {
  $('rail').innerHTML = TOOL_LIST.map(([id, label, key, icon]) =>
    `<button data-tool="${id}" title="${label} (${key})">` +
    `<svg viewBox="-44 -32 88 64" width="44" height="32"><path d="${icon}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>` +
    `<span>${label}</span><kbd>${key}</kbd></button>`).join('');
  $('rail').onclick = e => {
    const button = e.target.closest('button');
    if (button) setTool(button.dataset.tool);
  };
}

// Highlight the active tool and show/hide the value box
function updateToolbar() {
  const item = selectedId && findItem(selectedId);
  const editable = !!item && item.type !== 'wire' && item.value !== undefined;
  $('valueLabel').hidden = !editable;
  if (editable) $('valueInput').value = item.value;
  document.querySelectorAll('#rail button').forEach(b => b.classList.toggle('on', b.dataset.tool === tool));
}

function setTool(name) {
  tool = name;
  wireStart = null;
  if (name !== 'select') selectedId = null;
  updateToolbar();
  draw();
}

// ---------- Actions ----------
function deleteSelected() {
  if (selectedId) change(() => {
    drawing.items = drawing.items.filter(i => i.id !== selectedId);
    selectedId = null;
  });
}

function rotateSelected() {
  const item = selectedId && findItem(selectedId);
  if (item && item.type !== 'wire') change(() => { item.rotation = (item.rotation + 90) % 360; });
  else { ghostRotation = (ghostRotation + 90) % 360; draw(); }   // nothing selected: rotate the preview
}

function setSelectedValue(text) {
  const item = findItem(selectedId);
  if (item) change(() => { item.value = text; });
}

// ---------- Mouse / touch ----------
const pointerPosition = e => {
  const box = svg.getBoundingClientRect();
  return [snapToGrid(e.clientX - box.left), snapToGrid(e.clientY - box.top)];
};

svg.addEventListener('pointerdown', e => {
  const pos = pointerPosition(e);
  cursor = pos;
  const clicked = e.target.closest('.it');   // the wire or part under the pointer, if any

  if (tool === 'select') {
    selectedId = clicked ? +clicked.dataset.id : null;
    const item = selectedId && findItem(selectedId);
    // Parts can be dragged; wires cannot
    drag = item && item.type !== 'wire'
      ? { item, dx: pos[0] - item.x, dy: pos[1] - item.y, before: JSON.stringify(drawing), moved: false }
      : null;
    if (drag) svg.setPointerCapture(e.pointerId);
    updateToolbar();
    draw();

  } else if (tool === 'wire') {
    if (!wireStart) {
      wireStart = pos;                                   // first click: start
    } else if (pos + '' === wireStart + '') {
      wireStart = null;                                  // same point again: finish
    } else {
      // Next click: add an L-shaped run (horizontal first, then vertical)
      const start = wireStart;
      const horizontalFirst = Math.abs(pos[0] - start[0]) >= Math.abs(pos[1] - start[1]);
      const corner = horizontalFirst ? [pos[0], start[1]] : [start[0], pos[1]];
      change(() => {
        [[start, corner], [corner, pos]].forEach(([a, b]) => {
          if (a + '' !== b + '') drawing.items.push({ type: 'wire', id: drawing.nextId++, a, b });
        });
        wireStart = pos;   // keep going from here
      });
    }
    draw();

  } else {
    // A part tool is active: place the part
    change(() => drawing.items.push({
      type: tool, id: drawing.nextId++, x: pos[0], y: pos[1],
      rotation: ghostRotation, value: PARTS[tool].value
    }));
  }
});

svg.addEventListener('pointermove', e => {
  cursor = pointerPosition(e);
  if (drag) {   // move the dragged part
    const x = cursor[0] - drag.dx, y = cursor[1] - drag.dy;
    if (x !== drag.item.x || y !== drag.item.y) { drag.item.x = x; drag.item.y = y; drag.moved = true; }
  }
  if (drag || wireStart || PARTS[tool]) draw();
});

svg.addEventListener('pointerup', () => {
  if (drag && drag.moved) { undoStack.push(drag.before); saveDrawing(); }   // make the move undoable
  drag = null;
});

// ---------- Keyboard shortcuts ----------
addEventListener('keydown', e => {
  if (/INPUT|TEXTAREA/.test(e.target.tagName) || $('dialog').open) return;
  const key = e.key.toLowerCase();

  if (e.ctrlKey || e.metaKey) {
    if (key === 'z') { e.preventDefault(); undo(); }
    return;
  }
  if (key === 'escape') { if (wireStart) { wireStart = null; draw(); } else setTool('select'); }
  else if (key === 'delete' || key === 'backspace') deleteSelected();
  else if (key === 'r') rotateSelected();
  else if (key === 'v') setTool('select');
  else if (key === 'w') setTool('wire');
  else {
    // Part shortcuts come from the parts library (1, 2, 3...)
    const id = Object.keys(PARTS).find(id => PARTS[id].key === key);
    if (id) setTool(id);
  }
});
