/* ==========================================================
   config.js - settings and the PARTS LIBRARY
   Edit this file to add new components or change constants.
   ========================================================== */

const GRID = 20;                    // grid spacing in pixels
const STORAGE_KEY = 'sketchpad-v2'; // name used for auto-saving in the browser
const MAX_UNDO = 100;               // how many undo steps to remember
const SVG_NS = 'http://www.w3.org/2000/svg';

// Short helpers used everywhere
const $ = id => document.getElementById(id);
const svg = $('canvas');

/* ----------------------------------------------------------
   PARTS LIBRARY - one entry per component.

   To add a new part, copy an entry and change:
     name    label shown on the toolbar
     key     keyboard shortcut (a single character, must be unique)
     value   default label shown under the part ("1k", "5V").
             Use '' for an editable but empty label.
             Leave this line out for parts with no label (e.g. ground).
     shape   SVG path drawn around the point (0,0)
     pins    connection points as [x, y]; keep them on multiples of 20
     hitBox  [width, height] of the clickable area
   ---------------------------------------------------------- */
const PARTS = {
  R: {
    name: 'Resistor', key: '1', value: '1k',
    shape: 'M-40 0H-22L-17-9L-7 9L3-9L13 9L18 0H40',
    pins: [[-40, 0], [40, 0]], hitBox: [80, 40]
  },
  C: {
    name: 'Capacitor', key: '2', value: '100n',
    shape: 'M-40 0H-6M-6-14V14M6-14V14M6 0H40',
    pins: [[-40, 0], [40, 0]], hitBox: [80, 40]
  },
  V: {
    name: 'Battery', key: '3', value: '5V',
    shape: 'M-40 0H-6M-6-8V8M6-16V16M6 0H40M12-22H20M16-26V-18',
    pins: [[-40, 0], [40, 0]], hitBox: [80, 40]
  },
  L: {
    name: 'LED', key: '4', value: '',
    shape: 'M-40 0H-12M-12-14L12 0L-12 14ZM12-14V14M12 0H40M0-20L8-28M6-22L14-30',
    pins: [[-40, 0], [40, 0]], hitBox: [80, 40]
  },
  G: {
    name: 'Ground', key: '5',
    shape: 'M0-20V0M-14 0H14M-9 6H9M-4 12H4',
    pins: [[0, -20]], hitBox: [40, 40]
  }
};
