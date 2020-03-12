import mainReducer from "./mainReducer";

import {
  UNDO,
  REDO,
} from "../../actions/redux";

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

const initialState = {
  workspaceSettings: {
    canvasWidth: initWidth,
    canvasHeight: initHeight,
    translateX: 0,
    translateY: 0,
    zoomPct: 100
  },
  colorSettings: {
    primary: "rgba(0, 0, 0, 1)",
    secondary: "rgba(255, 255, 255, 1)"
  },
  // NOTE: Tool opacity uses 0 - 100 instead of 0 - 1. This is so the number input component won't get confused. Opacity is converted to 0 - 1 format in DrawSpace.
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
  layerData: {
    1: {
      data: initCanvas,
      queue: null,
      ctx: initCanvas.getContext("2d")
    },
    selection: {
      data: selectionCanvas,
      queue: null,
      ctx: selectionCanvas.getContext("2d")
    },
    clipboard: {
      data: clipboardCanvas,
      queue: null,
      ctx: clipboardCanvas.getContext("2d")  
    }
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
  draggedLayercard: null,
  activeLayer: 1,
  layerCounter: 2,
  activeTool: "pencil",
  history: {
    past: [],
    future: [],
    undoLimit: 20
  }
};

const rootReducer = (state = initialState, {type, payload}) => {
  let past = state.history.past;
  let future = state.history.future; 
  switch (type) {
    case UNDO:
      if (!past.length) {
        return state;
      }
      const undoObject = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      const newFuture = [...future, undoObject]
      const { undoPayload } = undoObject;

      if (undoPayload.canvasData) {
        return {
          ...state,
          layerData: {
            ...state.layerData,
            [undoPayload.canvasData.id]: {
              ...state.layerData[undoPayload.canvasData.id],
              queue: {
                type: "manipulate",
                action: "replace",
                params: {
                  source: undoPayload.canvasData.data,
                  ignoreHistory: true
                }
              }
            }
          },
          history: {
            ...state.history,
            past: [...newPast],
            future: [...newFuture]
          }
        }
      } else {
        const { layerData={}, ...rest } = undoPayload.state;
        return {
          ...state,
          ...rest,
          layerData: {...state.layerData, ...layerData},
          history: {
            ...state.history,
            past: newPast,
            future: newFuture
          }
        };
      }

    case REDO:
      const redoAction = {
        type: future[future.length - 1].type,
        payload: future[future.length - 1].payload
      }
      const newState = {
        ...state,
        history: {
          ...state.history,
          future: future.slice(0, future.length - 1)
        }
      }
      return mainReducer(newState, redoAction);

    default:
      if (state.history.future.length) {
        state = {...state, history: {...state.history, future: []}}
      }
      return mainReducer(state, {type, payload});
  }
};

export default rootReducer;
