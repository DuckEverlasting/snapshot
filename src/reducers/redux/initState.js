
let selectionCanvas = document.createElement("canvas");
let initCanvas = document.createElement("canvas");
let clipboardCanvas = document.createElement("canvas");
let initWidth = (window.innerWidth - 300) * .8;
let initHeight = (window.innerHeight - 30) * .8;
selectionCanvas.width = initWidth;
selectionCanvas.height = initHeight;
initCanvas.width = initWidth;
initCanvas.height = initHeight;
clipboardCanvas.width = initWidth;
clipboardCanvas.height = initWidth;

export const initMainState = {
  documentSettings: {
    canvasWidth: initWidth,
    canvasHeight: initHeight,
  },
  layerData: {
    1: initCanvas,
    selection: selectionCanvas,
    clipboard: clipboardCanvas,
  },
  layerQueue: {
    1: null,
    selection: null,
    clipboard: null,
  },
  layerSettings: {
    1: {
      name: "layer 1",
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
  layerOrder: ["clipboard", 1, "selection"],  
  layerCounter: 2,
  activeLayer: 1,
};

export const initUiState = {
  workspaceSettings: {
    translateX: 0,
    translateY: 0,
    zoomPct: 100
  },
  // NOTE: Tool opacity uses 0 - 100 instead of 0 - 1. 
  // This is so the number input component won't get confused.
  // Opacity is converted to 0 - 1 format in DrawSpace.
  toolSettings: {
    pencil: { name: "Pencil", width: 5, opacity: 100 },
    brush: { name: "Brush", width: 15, opacity: 100 },
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
}