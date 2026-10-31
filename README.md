# Schematic sketchpad

A browser-based circuit drawing tool. No build step: open `index.html`
(or drag the folder onto Netlify Drop / Cloudflare Pages) and it runs.

## Where things live

| File | Job | Edit it to... |
|---|---|---|
| `index.html` | Page structure and script order | add buttons or panels |
| `css/style.css` | Colours and layout | re-theme the app (see the `:root` block) |
| `js/config.js` | Settings and the **parts library** | add components, change grid size |
| `js/state.js` | Drawing data, undo, saving | change what is stored |
| `js/render.js` | Draws everything on the canvas | change how things look |
| `js/tools.js` | Toolbar, mouse and keyboard | add tools or shortcuts |
| `js/export.js` | SVG export | add PNG / PDF / LaTeX export |
| `js/main.js` | Wires up the buttons, starts the app | add new top-bar buttons |

## Add a new part (e.g. a diode)

1. Open `js/config.js`.
2. Copy an entry inside `PARTS`, give it a new id (`D`), name, shortcut `key`,
   a `shape` path, `pins` and `hitBox`.
3. Save and refresh. The toolbar button, keyboard shortcut, placement,
   rotation and export all work automatically.

## Rules to remember

- Script order in `index.html` matters: config, state, render, tools, export, main.
- Change the drawing only through `change(() => { ... })` in `state.js`,
  so Undo, saving and redrawing happen for you.
- Keep part pins on multiples of 20 so wires snap to them.
