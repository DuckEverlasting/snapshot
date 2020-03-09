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
let initWidth = window.innerWidth * .7;
let initHeight = window.innerHeight * .8;
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
    width: initWidth,
    height: initHeight,
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
  activeTool: "pencil"
};

const rootReducer = (state = initialState, {type, payload}) => {
  switch (type) {
    case CREATE_LAYER:
      let { position, special } = payload;
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

      return {
        ...state,
        layerData: {...state.layerData, [layerID]: newLayerData},
        layerSettings: {...state.layerSettings, [layerID]: newLayerSettings},
        layerOrder: orderAfterCreate,
        activeLayer: special ? state.activeLayer : state.layerCounter,
        layerCounter: special ? state.layerCounter : state.layerCounter + 1,
      };
    
    case DELETE_LAYER:
      let afterDeleteData = {...state.layerData, [payload]: undefined}
      let afterDeleteSettings = {...state.layerSettings, [payload]: undefined}
      let afterDeleteOrder = state.layerOrder.filter(id => {
        return id !== payload;
      });
      let afterDeleteActive = state.activeLayer === payload ? null : state.activeLayer
      return {
        ...state,
        layerData: afterDeleteData,
        layerSettings: afterDeleteSettings,
        layerOrder: afterDeleteOrder,
        activeLayer: afterDeleteActive
      };
    
    case HIDE_LAYER:
      let afterHiddenSettings = {
        ...state.layerSettings, 
        [payload]: {
          ...state.layerSettings[payload],
          hidden: !state.layerSettings[payload].hidden
        }
      }
      
      let activeLayer = state.activeLayer;
      if (activeLayer === payload) activeLayer = null;
      return {
        ...state,
        layerSettings: afterHiddenSettings,
        activeLayer
      }

    case UPDATE_LAYER_DATA:
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
          layerData: afterUpdateData
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
      return {
        ...state,
        selectionPath: payload
      }

    case UPDATE_LAYER_OPACITY:
      let afterOpacitySettings = {
        ...state.layerSettings, 
        [payload.id]: {
          ...state.layerSettings[payload.id],
          opacity: payload.opacity,
        }
      }

      return {
        ...state,
        layerSettings: afterOpacitySettings
      };

    case UPDATE_LAYER_ORDER:
      let { from, to } = payload;
      let newLayerOrder = state.layerOrder.slice(0);
      newLayerOrder.splice(to, 0, newLayerOrder.splice(from, 1)[0]);
      return {
        ...state,
        layerOrder: newLayerOrder
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
        layerSettings: afterRenameSettings
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
      return {
        ...state,
        activeLayer: payload
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
      return {
        ...state,
        colorSettings: {
          ...state.colorSettings,
          [key]: value
        }
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

    default:
      return state;
  }
};

export default rootReducer;
