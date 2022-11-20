import { getCanvas } from "../../../utils/helpers";

const getInitWidth = () => Math.floor((window.innerWidth - 300) * .8);
const getInitHeight = () => Math.floor((window.innerHeight - 30) * .8);
// NOTE: Opacity uses 0 - 100 instead of 0 - 1. 
// This is so the number input component won't get confused.
// Opacity is converted to 0 - 1 format when drawn.

const getInitSelectionPath = (width=getInitWidth(), height=getInitHeight()) => {
  const initSelectionPath = new Path2D();
  initSelectionPath.rect(0, 0, width, height);
}

const getBgPattern = (dim = 10) => {
  const pattern = getCanvas(dim, dim),
    ctx = pattern.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, dim, dim);
  ctx.fillStyle = '#ccc';
  ctx.fillRect(0, 0, dim / 2, dim / 2);
  ctx.fillRect(dim / 2, dim / 2, dim, dim);
  return pattern;
}

export const getInitProjectState = (id, name="My Great Document", width=getInitWidth(), height=getInitHeight()) => ({
  past: [],
  future: [],
  present: {
    id,
    onUndo: null,
    onRedo: null,
    documentSettings: {
      documentWidth: width,
      documentHeight: height,
      documentName: name
    },
    layerCanvas: {
      1: getCanvas(width, height, { willReadFrequently: true, desynchronized: true })
    },
    layerSettings: {
      1: {
        name: "Layer 1",
        type: "raster",
        nameEditable: false,
        size: {
          w: width,
          h: height
        },
        offset: {
          x: 0,
          y: 0
        },
        hidden: false,
        opacity: 100,
        blend: "source-over"
      }
    },
    selectionPath: getInitSelectionPath(width, height),
    selectionActive: false,
    previousSelection: null,
    renderOrder: [1],
    layerCounter: 2,
    activeLayer: 1,
    historyIsDisabled: false
  }
});

export const getInitMainState = (width=getInitWidth(), height=getInitHeight(), initProject) => {
  return {
    projects: initProject ? {[initProject.id]: initProject} : {},
    projectTabOrder: initProject ? [initProject.id] : [],
    activeProject: initProject ? initProject.id : null,
    mainCanvas: null,
    utilityCanvas: {
      clipboard: getCanvas(width, height, { willReadFrequently: true, desynchronized: true }),
      placeholder: getCanvas(width, height, { willReadFrequently: true, desynchronized: true }),
      staging: getCanvas(width, height, { willReadFrequently: true, desynchronized: true })
    },
    stagingPinnedTo: 1,
    clipboardUsed: false,
    clipboardSettings: {
      offset: {
        x: 0,
        y: 0
      }
    },
    stampData: {
      canvas: null,
      origin: null,
      destination: null
    },
    lastEndpoint: null,
    currentToolAction: null,
    tick: 0
}};

export const getInitUiState = () => ({
  workspaceSettings: {
    translateX: 0,
    translateY: 0,
    zoomPct: 100
  },
  modKeys: {
    shift: false,
    ctrl: false,
    alt: false
  },
  dpi: window.devicePixelRatio,
  bgPattern: getBgPattern(),
  toolSettings: {
    pencil: { name: "Pencil", width: 5, opacity: 100, smooth: true },
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
    selectionFill: { name: "Fill Select", tolerance: 0, targetAll: false },
    crop: { name: "Crop" },
    move: { name: "Move" },
    hand: { name: "Hand" },
    zoom: { name: "Zoom" },
    bucketFill: { name: "Paint Bucket", opacity: 100, tolerance: 0 },
    saturate: { name: "Saturate", width: 20, hardness: 0, amount: 50 },
    stamp: { name: "Stamp", width: 20, opacity: 100, hardness: 0 },
    dodge: { name: "Dodge", width: 20, hardness: 0, amount: 50, range: "Midtones" },
    burn: { name: "Burn", width: 20, hardness: 0, amount: 50, range: "Midtones" },
    blur: { name: "Blur", width: 20, hardness: 0, amount: 50 },
    sharpen: { name: "Sharpen", width: 20, hardness: 0, amount: 50 },
    // TEST: { name: "TEST" },
  },
  colorSettings: {
    primary: "rgba(0, 0, 0, 1)",
    secondary: "rgba(255, 255, 255, 1)"
  },
  draggedLayercard: null,
  activeTool: "pencil",
  overlay: "newDocument",
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
  cropIsActive: false,
  cropParams: {
    startDimensions: null 
  },
  appIsWaiting: false
})