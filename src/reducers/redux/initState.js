let initWidth = (window.innerWidth - 300) * .8;
let initHeight = (window.innerHeight - 30) * .8;

export const initMainState = {
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
  layerOrder: ["clipboard", 1, "selection", "staging"],  
  layerCounter: 2,
  activeLayer: 1,
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
    fillRect: { name: "Fill Rectangle", width: undefined, opacity: 100 },
    drawRect: { name: "Draw Rectangle", width: 5, opacity: 100 },
    fillCirc: { name: "Fill Circle", width: undefined, opacity: 100 },
    drawCirc: { name: "Draw Circle", width: 5, opacity: 100 },
    eraser: { name: "Eraser", width: 5, opacity: undefined },
    eyeDropper: { name: "Eye Dropper", width: undefined, opacity: undefined },
    selectRect: { name: "Select Rectangle", width: undefined, opacity: undefined },
    move: { name: "Move", width: undefined, opacity: undefined },
    hand: { name: "Hand", width: undefined, opacity: undefined },
    zoom: { name: "Zoom", width: undefined, opacity: undefined },
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
  activeMenuList: null
}