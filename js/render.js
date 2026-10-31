/* ==========================================================
   render.js - turns the drawing data into pictures
   Edit this file to change how things LOOK on the canvas
   (line thickness, label style, pin circles, junction dots).
   ========================================================== */

// Line style used for every wire and symbol
const strokeStyle = color =>
  `fill="none" style="stroke:${color};stroke-width:2;stroke-linecap:round;stroke-linejoin:round"`;

// Makes user-typed text safe to put in the page
const escapeHtml = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// One part's symbol. clickable=false is used for the ghost preview and export.
function partMarkup(part, color, opacity, clickable) {
  const def = PARTS[part.type], [w, h] = def.hitBox;
  const attrs = clickable ? `class="it" data-id="${part.id}"` : '';
  const hitRect = clickable ? `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="transparent"/>` : '';
  return `<g ${attrs} transform="translate(${part.x} ${part.y}) rotate(${part.rotation})" opacity="${opacity}">` +
         `${hitRect}<path d="${def.shape}" ${strokeStyle(color)}/></g>`;
}

// Everything in the drawing as SVG markup.
// forExport=true leaves out selection colours, pin circles and click areas.
function drawingMarkup(forExport) {
  let shapes = '', labels = '';
  const pointCount = {};   // how many things meet at each point (for junction dots)
  const countPoint = p => { pointCount[p + ''] = (pointCount[p + ''] || 0) + 1; };

  for (const item of drawing.items) {
    const color = !forExport && item.id === selectedId ? 'var(--sel)' : 'var(--wire)';

    if (item.type === 'wire') {
      const [x1, y1] = item.a, [x2, y2] = item.b;
      const hitLine = forExport ? '' : `<line class="hit" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
      shapes += `<g class="it" data-id="${item.id}">${hitLine}` +
                `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${strokeStyle(color)}/></g>`;
      countPoint(item.a); countPoint(item.b);

    } else {
      shapes += partMarkup(item, color, 1, !forExport);
      for (const [px, py] of pinsOf(item)) {
        countPoint([px, py]);
        if (!forExport) shapes += `<circle cx="${px}" cy="${py}" r="3" style="fill:var(--panel);stroke:${color};stroke-width:1.5"/>`;
      }
      if (item.value) {   // value label: below the part, or beside it when rotated
        const flat = item.rotation % 180 === 0;
        labels += `<text x="${item.x + (flat ? 0 : 16)}" y="${item.y + (flat ? 34 : 4)}" ` +
                  `text-anchor="${flat ? 'middle' : 'start'}" ` +
                  `style="font:12px 'IBM Plex Mono',monospace;fill:var(--muted)">${escapeHtml(item.value)}</text>`;
      }
    }
  }

  // Junction dots where 3 or more things meet
  for (const key in pointCount) {
    if (pointCount[key] >= 3) {
      const [x, y] = key.split(',');
      shapes += `<circle cx="${x}" cy="${y}" r="4.5" style="fill:var(--wire)"/>`;
    }
  }
  return shapes + labels;
}

// Help text in the bottom bar
function updateHint() {
  let text;
  if (tool === 'select') text = 'Click to select, drag parts to move. R rotates, Delete removes.';
  else if (tool === 'wire') text = wireStart
    ? 'Click each corner. Click the same point again, or press Esc, to finish.'
    : 'Click a pin or any grid dot to start a wire.';
  else text = `Click the grid to place a ${PARTS[tool].name.toLowerCase()}. R rotates it. Esc stops.`;
  $('hint').textContent = text;
}

// Redraw the whole canvas (called after every change)
function draw() {
  const W = svg.clientWidth, H = svg.clientHeight;

  // 1. Grid dots
  let out = `<defs><pattern id="grid" width="${GRID}" height="${GRID}" patternUnits="userSpaceOnUse" patternTransform="translate(-1 -1)">` +
            `<circle cx="1" cy="1" r="1" style="fill:var(--grid)"/></pattern></defs>` +
            `<rect width="100%" height="100%" fill="url(#grid)"/>`;

  // 2. The drawing itself
  out += drawingMarkup(false);

  // 3. Dashed preview while drawing a wire (horizontal first, then vertical)
  if (tool === 'wire' && wireStart) {
    const goesHorizontalFirst = Math.abs(cursor[0] - wireStart[0]) >= Math.abs(cursor[1] - wireStart[1]);
    const corner = goesHorizontalFirst ? [cursor[0], wireStart[1]] : [wireStart[0], cursor[1]];
    out += `<path d="M${wireStart}L${corner}L${cursor}" fill="none" style="stroke:var(--sel);stroke-width:2;stroke-dasharray:5 4"/>`;
  }

  // 4. Faded preview of the part about to be placed
  if (PARTS[tool]) out += partMarkup({ type: tool, x: cursor[0], y: cursor[1], rotation: ghostRotation }, 'var(--sel)', 0.55, false);

  // 5. Message shown on an empty canvas
  if (!drawing.items.length) {
    out += `<g text-anchor="middle" style="font:15px 'IBM Plex Sans',sans-serif;fill:var(--muted)">` +
           `<text x="${W / 2}" y="${H / 2 - 4}">Choose a part on the left, then click the grid to place it.</text>` +
           `<text x="${W / 2}" y="${H / 2 + 20}">Use Wire to connect the pins.</text></g>`;
  }

  svg.style.cursor = tool === 'select' ? 'default' : 'crosshair';
  svg.innerHTML = out;
  updateHint();
}
