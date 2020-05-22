const initWidth = (window.innerWidth - 300) * .8;
const initHeight = (window.innerHeight - 30) * .8;
const initSelectionPath = new Path2D();
initSelectionPath.rect(0, 0, initWidth, initHeight);

export const initMainState = {
  onUndo: null,
  onRedo: null,
  onUndelete: null,
  documentSettings: {
    documentWidth: initWidth,
    documentHeight: initHeight,
  },
  layerData: {
    1: null,
    selection: null,
    clipboard: null,
    placeholder: null,
    staging: null
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
    },
    "selection": {
      size: {
        w: initWidth,
        h: initHeight
      },
      offset: {
        x: 0,
        y: 0
      },
    }
  },
  selectionPath: initSelectionPath,
  selectionActive: false,
  transformSelectionTarget: null,
  transformParams: {
    startEvent: null,
    resizable: false,
    rotatable: false
  },
  stagingPinnedTo: 1,
  layerOrder: [1],
  layerCounter: 2,
  activeLayer: 1,
  clipboardUsed: false
};

export const initUiState = {
  workspaceSettings: {
    height: window.innerHeight,
    width: window.innerWidth,
    translateX: 0,
    translateY: 0,
    zoomPct: 100
  },
  // NOTE: Tool opacity uses 0 - 100 instead of 0 - 1. 
  // This is so the number input component won't get confused.
  // Opacity is converted to 0 - 1 format when drawn.
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
    TEST: { name: "TEST" }
  },
  colorSettings: {
    primary: "rgba(0, 0, 0, 1)",
    secondary: "rgba(255, 255, 255, 1)"
  },
  draggedLayercard: null,
  activeTool: "pencil",
  menuIsActive: false,
  activeMenuList: null,
  overlayVisible: null,
  currentHelpTopic: "tools",
  currentFilter: null,
  importImageFile: null
}