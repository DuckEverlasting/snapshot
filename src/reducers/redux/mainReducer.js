import {
  CREATE_LAYER,
  DELETE_LAYER,
  HIDE_LAYER,
  UPDATE_LAYER_DATA,
  UPDATE_LAYER_QUEUE,
  CLEAR_LAYER_QUEUE,
  UPDATE_SELECTION_PATH,
  UPDATE_LAYER_OPACITY,
  UPDATE_LAYER_ORDER,
  ENABLE_LAYER_RENAME,
  UPDATE_LAYER_NAME,
  DRAG_LAYERCARD,
  END_DRAG_LAYERCARD,
  MAKE_ACTIVE_LAYER,
  MAKE_ACTIVE_TOOL,
  UPDATE_TOOL_SETTINGS,
  UPDATE_COLOR,
  UPDATE_WORKSPACE_SETTINGS,
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

const addToHistory = (history, data) => ({
    undoStack = [...history.undoStack, data],
    redoStack = []
})

const getMockState = () => ({
  workspaceSettings: {},
  layerData: {},
  layerSettings: {}
})

const initialState = {
  // UNDOABLE (canvaswidth, canvasheight) - 1 deep
  workspaceSettings: {
    canvasWidth: initWidth,
    canvasHeight: initHeight,
    translateX: 0,
    translateY: 0,
    zoomPct: 100
  },
  // UNDOABLE - 0 deep
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
    TEST: { name: "TEST" }
  },
  // UNDOABLE - 1 deep
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
  // UNDOABLE - 1 deep
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
  // UNDOABLE - 0 deep
  selectionPath: null,
  // UNDOABLE - 0 deep
  layerOrder: ["clipboard", 1, "selection"],
  draggedLayercard: null,
  // UNDOABLE - 0 deep
  activeLayer: 1,
  // UNDOABLE - 0 deep
  layerCounter: 2,
  activeTool: "pencil",
  history: {
    undoStack: [],
    redoStack: []
  }
};

const mainReducer = (state = initialState, {type, payload}) => {
  let undoData;
  switch (type) {
    case UNDO:
      undoData = state.history.undoStack[state.history.undoStack.length - 1]
      return state;
    case CREATE_LAYER:
      let { position, special, ignoreHistory } = payload;
      let canvas = document.createElement("canvas");
      canvas.width = state.workspaceSettings.canvasWidth;
      canvas.height = state.workspaceSettings.canvasHeight;
      canvas.getContext("2d").imageSmoothingEnabled = false;
      const layerID = special ? special : state.layerCounter;
      const newLayerData = {
        data: canvas,
        queue: null,
        ctx: canvas.getContext("2d")
      };
      const newLayerSettings = {
        name: special ? undefined : `layer ${state.layerCounter}`,
        nameEditable: false,
        hidden: false,
        opacity: 1,
      };
      let orderAfterCreate = state.layerOrder.slice(0);
      orderAfterCreate.splice(position, 0, layerID);
      undoData = {
        state: {
          layerData: {[layerID]: undefined},
          layerSettings: {[layerID]: undefined},
          activeLayer: state.activeLayer,
          layerCounter: state.layerCounter,
          layerOrder: [...state.layerOrder]
        }
      }

      return {
        ...state,
        layerData: {...state.layerData, [layerID]: newLayerData},
        layerSettings: {...state.layerSettings, [layerID]: newLayerSettings},
        layerOrder: orderAfterCreate,
        activeLayer: special ? state.activeLayer : state.layerCounter,
        layerCounter: special ? state.layerCounter : state.layerCounter + 1,
        history: ignoreHistory ? {...state.history} : addToHistory(state.history, {
          type: CREATE_LAYER,
          undoPayload: undoData,
          redoPayload: payload
        })
      };
    
    case DELETE_LAYER:
      undoData = {
        state: {
          layerData: {[payload.id]: {...state.layerData[payload.id]}},
          settings: {...state.layerSettings[payload.id]},
          order: [...state.layerOrder]
        }
      }
      let afterDeleteData = {...state.layerData, [payload.id]: undefined}
      let afterDeleteSettings = {...state.layerSettings, [payload.id]: undefined}
      let afterDeleteOrder = state.layerOrder.filter(id => {
        return id !== payload.id;
      });
      let afterDeleteActive = state.activeLayer === payload.id ? null : state.activeLayer
      return {
        ...state,
        layerData: afterDeleteData,
        layerSettings: afterDeleteSettings,
        layerOrder: afterDeleteOrder,
        activeLayer: afterDeleteActive,
        history: payload.ignoreHistory ? {...state.history} : addToHistory(state.history, {
          type: DELETE_LAYER,
          undoPayload: undoData,
          redoPayload: payload
        })
      };
    
    case HIDE_LAYER:
      undoData = {
        id: payload,
        wasActive: state.activeLayer === payload
      };
      let afterHiddenSettings = {
        ...state.layerSettings, 
        [payload]: {
          ...state.layerSettings[payload],
          hidden: !state.layerSettings[payload].hidden,
        }
      }
      
      let activeLayer = state.activeLayer;
      if (activeLayer === payload) activeLayer = null;
      return {
        ...state,
        layerSettings: afterHiddenSettings,
        activeLayer,
        history: addToHistory(state.history, {
          type: HIDE_LAYER,
          undoPayload: undoData,
          redoPayload: payload
        })
      }

    case UPDATE_LAYER_DATA:
      undoData = {
        id: payload.id,
        data: state.layerData[payload.id].ctx.getImageData(0, 0, state.canvasWidth, state.canvasHeight),
      }
      let afterUpdateData = {
        ...state.layerData, 
        [payload.id]: {
          ...state.layerData[payload.id],
          data: payload.changes,
          ctx: payload.changes.getContext('2d')
        }
      }
      
      return {
        ...state,
        layerData: afterUpdateData,
        history: payload.ignoreHistory ? {...state.history} : addToHistory(state.history, {
          type: UPDATE_LAYER_DATA,
          undoPayload: undoData,
          redoPayload: payload
        })
      };

    case UPDATE_LAYER_QUEUE:
      let afterUpdateQueue = {
        ...state.layerData, 
        [payload.id]: {
          ...state.layerData[payload.id],
          queue: payload.changes,
        }
      }
      
      return {
        ...state,
        layerData: afterUpdateQueue
      };
    
    case CLEAR_LAYER_QUEUE:
      let afterClearQueue = {
        ...state.layerData, 
        [payload.id]: {
          ...state.layerData[payload.id],
          queue: {update: null, get: null},
        }
      }
      
      return {
        ...state,
        layerData: afterClearQueue
      };
    
    case UPDATE_SELECTION_PATH:
      undoData = state.selectionPath ? new Path2D(state.selectionPath) : null
      return {
        ...state,
        selectionPath: payload,
        history: addToHistory(state.history, {
          type: UPDATE_SELECTION_PATH,
          undoPayload: undoData,
          redoPayload: payload
        })
      }

    case UPDATE_LAYER_OPACITY:
      undoData = {
        id: payload.id,
        opacity: state.layerSettings[payload.id].opacity
      }
      let afterOpacitySettings = {
        ...state.layerSettings, 
        [payload.id]: {
          ...state.layerSettings[payload.id],
          opacity: payload.opacity,
        }
      }

      return {
        ...state,
        layerSettings: afterOpacitySettings,
        history: addToHistory(state.history, {
          type: UPDATE_LAYER_OPACITY,
          undoPayload: undoData,
          redoPayload: payload
        })
      };

    case UPDATE_LAYER_ORDER:
      let { from, to } = payload;
      undoData = {
        layerOrder: [...state.layerOrder]
      }
      let newLayerOrder = state.layerOrder.slice(0);
      newLayerOrder.splice(to, 0, newLayerOrder.splice(from, 1)[0]);
      return {
        ...state,
        layerOrder: newLayerOrder,
        history: addToHistory(state.history, {
          type: UPDATE_LAYER_ORDER,
          undoPayload: undoData,
          redoPayload: payload
        })
      };

    case ENABLE_LAYER_RENAME:
      let afterEnableSettings =  {
        ...state.layerSettings, 
        [payload.id]: {
          ...state.layerSettings[payload.id],
          nameEditable: true
        }
      }

      return {
        ...state,
        layerSettings: afterEnableSettings
      };

    case UPDATE_LAYER_NAME:
      undoData = {
        id: payload.id,
        prevName: state.layerSettings[payload.id].name
      }
      let afterRenameSettings = {
        ...state.layerSettings, 
        [payload.id]: {
          ...state.layerSettings[payload.id],
          name: payload.name,
          nameEditable: false
        }
      }

      return {
        ...state,
        layerSettings: afterRenameSettings,
        history: addToHistory(state.history, {
          type: UPDATE_LAYER_NAME,
          undoPayload: undoData,
          redoPayload: payload
        })
      };

    case DRAG_LAYERCARD:
      return {
        ...state,
        draggedLayercard: payload
      };

    case END_DRAG_LAYERCARD:
      return {
        ...state,
        draggedLayercard: null,
      }

    case MAKE_ACTIVE_LAYER:
      undoData = { prevActive: state.activeLayer }
      return {
        ...state,
        activeLayer: payload,
        history: addToHistory(state.history, {
          type: MAKE_ACTIVE_LAYER,
          undoPayload: undoData,
          redoPayload: payload
        })
      };

    case MAKE_ACTIVE_TOOL:
      return {
        ...state,
        activeTool: payload
      };

    case UPDATE_TOOL_SETTINGS:
      let { tool, changes: toolChanges } = payload;
      return {
        ...state,
        toolSettings: {
          ...state.toolSettings,
          [tool]: toolChanges
        }
      };

    case UPDATE_COLOR:
      let { key, value } = payload;
      undoData = { prevColorSettings: {...state.colorSettings} }
      return {
        ...state,
        colorSettings: {
          ...state.colorSettings,
          [key]: value
        },
        history: addToHistory(state.history, {
          type: UPDATE_COLOR,
          undoPayload: undoData,
          redoPayload: payload
        })
      };

    case UPDATE_WORKSPACE_SETTINGS:
      let workspaceSettingsChanges = payload;
      return {
        ...state,
        workspaceSettings: {
          ...state.workspaceSettings,
          ...workspaceSettingsChanges
        }
      };

    case UNDO:
      return state;
    
    case REDO:
      return state;

    default:
      return state;
  }
};

export default mainReducer;
