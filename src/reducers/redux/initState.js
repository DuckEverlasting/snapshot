const initWidth = Math.floor((window.innerWidth - 300) * .8);
const initHeight = Math.floor((window.innerHeight - 30) * .8);
const initSelectionPath = new Path2D();
initSelectionPath.rect(0, 0, initWidth, initHeight);

// NOTE: Opacity uses 0 - 100 instead of 0 - 1. 
// This is so the number input component won't get confused.
// Opacity is converted to 0 - 1 format when drawn.

export const getInitMainState = () => ({
  onUndo: null,
  onRedo: null,
  documentSettings: {
    documentWidth: initWidth,
    documentHeight: initHeight,
    documentName: "My Great Document"
  },
  layerCanvas: {
    main: null,
    1: new OffscreenCanvas(initWidth, initHeight),
    selection: new OffscreenCanvas(initWidth, initHeight),
    clipboard: new OffscreenCanvas(initWidth, initHeight),
    placeholder: new OffscreenCanvas(initWidth, initHeight),
    staging: new OffscreenCanvas(initWidth, initHeight)
  },
  layerSettings: {
    1: {
      name: "Layer 1",
      nameEditable: false,
      size: {
        w: initWidth,
        h: initHeight
      },
      offset: {
        x: 0,
        y: 0
      },
      hidden: false,
      opacity: 100,
      blend: "source-over"
    },
    "selection": {
      size: {
        w: initWidth,
        h: initHeight
      },
      offset: {
        x: 0,
        y: 0
      }
    },
    "clipboard": {
      size: {
        w: initWidth,
        h: initHeight
      },
      offset: {
        x: 0,
        y: 0
      }
    }
  },
  selectionPath: initSelectionPath,
  selectionActive: false,
  stagingPinnedTo: 1,
  layerOrder: [1],
  layerCounter: 2,
  activeLayer: 1,
  clipboardUsed: false,
  stampData: {
    canvas: null,
    origin: null,
    destination: null
  },
  historyIsDisabled: false
});

export const getInitUiState = () => ({
  workspaceSettings: {
    translateX: 0,
    translateY: 0,
    zoomPct: 100
  },
  toolSettings: {
    pencil: { name: "Pencil", width: 5, opacity: 100 },
    brush: { name: "Brush", width: 50, opacity: 100, hardness: 50 },
    line: { name: "Line", width: 5, opacity: 100 },
    fillRect: { name: "Fill Rectangle", opacity: 100 },
    drawRect: { name: "Draw Rectangle", width: 5, opacity: 100 },
    fillEllipse: { name: "Fill Ellipse", opacity: 100 },
    drawEllipse: { name: "Draw Ellipse", width: 5, opacity: 100 },
    eraser: { name: "Eraser", width: 5, opacity: 100, hardness: 50 },
    eyeDropper: { name: "Eye Dropper" },
    selectRect: { name: "Select Rectangle" },
    selectEllipse: { name: "Select Ellipse" },
    lasso: { name: "Lasso" },
    move: { name: "Move" },
    hand: { name: "Hand" },
    zoom: { name: "Zoom" },
    bucketFill: { name: "Paint Bucket", opacity: 100, tolerance: 0 },
    saturate: { name: "Saturate", width: 20, hardness: 0, amount: 50 },
    stamp: { name: "Stamp", width: 20, opacity: 100, hardness: 0 },
    dodge: { name: "Dodge", width: 20, hardness: 0, amount: 50, range: "Midtones" },
    burn: { name: "Burn", width: 20, hardness: 0, amount: 50, range: "Midtones" },
    blur: { name: "Blur", width: 20, hardness: 0, amount: 50 },
    sharpen: { name: "Sharpen", width: 20, hardness: 0, amount: 50 }
    // TEST: { name: "TEST", width: 20, hardness: 50, amount: 50 }
  },
  colorSettings: {
    primary: "rgba(0, 0, 0, 1)",
    secondary: "rgba(255, 255, 255, 1)"
  },
  draggedLayercard: null,
  activeTool: "pencil",
  overlay: null,
  menuIsDisabled: false,
  currentHelpTopic: "tools",
  currentFilter: null,
  importImageFile: null,
  transformTarget: null,
  transformParams: {
    startEvent: null,
    resizable: false,
    rotatable: false
  },
  appIsWaiting: false
})