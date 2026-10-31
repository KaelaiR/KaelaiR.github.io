/* ==========================================================
   export.js - turns the drawing into a standalone SVG file
   To add PNG, PDF or LaTeX (CircuiTikZ) export, start here.
   ========================================================== */

// Build a complete SVG document sized to fit the drawing
function svgOutput() {
  const xs = [], ys = [];
  drawing.items.forEach(item => {
    const points = item.type === 'wire' ? [item.a, item.b] : pinsOf(item);
    points.forEach(([x, y]) => { xs.push(x); ys.push(y); });
  });
  const margin = 50;
  const x0 = Math.min(...xs) - margin, y0 = Math.min(...ys) - margin;
  const w = Math.max(...xs) + margin - x0, h = Math.max(...ys) + margin - y0;

  // Swap the theme colours for fixed ones so the file looks right anywhere
  const markup = drawingMarkup(true)
    .replace(/var\(--wire\)/g, '#111')
    .replace(/var\(--muted\)/g, '#444');

  return `<svg xmlns="${SVG_NS}" viewBox="${x0} ${y0} ${w} ${h}" width="${w}" height="${h}">` +
         `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#fff"/>${markup}</svg>`;
}

function openExportDialog() {
  if (!drawing.items.length) return;
  $('svgText').value = svgOutput();
  $('dialog').showModal();
}

function copySvg() {
  const box = $('svgText');
  box.select();
  try { navigator.clipboard.writeText(box.value).catch(() => document.execCommand('copy')); }
  catch (e) { document.execCommand('copy'); }
  $('copySvg').textContent = 'Copied';
  setTimeout(() => { $('copySvg').textContent = 'Copy SVG'; }, 1500);
}

function downloadSvg() {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([$('svgText').value], { type: 'image/svg+xml' }));
  link.download = 'circuit.svg';
  link.click();
}
