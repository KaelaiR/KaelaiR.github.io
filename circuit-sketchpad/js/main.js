/* ==========================================================
   main.js - connects the page's buttons and starts the app
   ========================================================== */

buildToolRail();

// Top bar
$('undo').onclick = undo;
$('clear').onclick = () => {
  if (drawing.items.length) change(() => { drawing.items = []; selectedId = null; });
};
$('export').onclick = openExportDialog;

// Bottom bar: edit the selected part's value
$('valueInput').onchange = e => setSelectedValue(e.target.value);

// Export pop-up
$('copySvg').onclick = copySvg;
$('downloadSvg').onclick = downloadSvg;
$('closeDialog').onclick = () => $('dialog').close();

// Keep the canvas message centred when the window resizes
addEventListener('resize', draw);

// Go!
updateToolbar();
draw();
