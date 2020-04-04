let initWidth = (window.innerWidth - 300) * .8;
let initHeight = (window.innerHeight - 30) * .8;

export const initMainState = {
  onUndo: null,
  onRedo: null,
  onUndelete: null,
  documentSettings: {
    canvasWidth: initWidth,
    canvasHeight: initHeight,
  },
  layerData: {
    1: null,
    selection: null,
    clipboard: null,
    staging: null
  },
  layerSettings: {
    1: {
      name: "Layer 1",
      nameEditable: false,
      hidden: false,
      opacity: 1
    },
    staging: {
      name: undefined,
      nameEditable: false,
      hidden: false,
      opacity: 1
    },
    selection: {
      name: undefined,
      nameEditable: false,
      hidden: false,
      opacity: 1
    },
    clipboard: {
      name: undefined,
      nameEditable: false,
      hidden: true,
      opacity: 1
    }
  },
  selectionPath: null,
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
  // Opacity is converted to 0 - 1 format in DrawSpace.
  toolSettings: {
    pencil: { name: "Pencil", width: 5, opacity: 100 },
    brush: { name: "Brush", width: 50, opacity: 100, hardness: 50 },
    line: { name: "Line", width: 5, opacity: 100 },
    fillRect: { name: "Fill Rectangle", opacity: 100 },
    drawRect: { name: "Draw Rectangle", width: 5, opacity: 100 },
    fillEllipse: { name: "Fill Ellipse", opacity: 100 },
    drawEllipse: { name: "Draw Ellipse", width: 5, opacity: 100 },
    eraser: { name: "Eraser", width: 5, hardness: 50 },
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
  currentFilter: null
}