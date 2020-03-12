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

const addToHistory = (history, data) => ({
  ...history,  
  past: [...history.past, data],
})

const mainReducer = (state, {type, payload}) => {
  console.log("\ntype: ", type, " payload: ", payload, "\n\n")
  let undoData;
  switch (type) {
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
          layerSettings: {...state.layerSettings, [layerID]: {...state.layerSettings[layerID]}},
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
          layerSettings: {...state.layerSettings, [payload.id]: {...state.layerSettings[payload.id]}},
          layerOrder: [...state.layerOrder]
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
        state: {
          layerSettings: {...state.layerSettings, [payload]: {...state.layerSettings[payload]}},
          activeLayer: state.activeLayer
        }
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
      undoData = payload.ignoreHistory ? null : {
        canvasData: {
          id: payload.id,
          data: payload.prevImgData, 
        },
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
      undoData = {
        state: {
          selectionPath: state.selectionPath ? new Path2D(state.selectionPath) : null
        }
      }
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
        state: {
          layerSettings: {...state.layerSettings, [payload.id]: {...state.layerSettings[payload.id]}}        }
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
        state: {
          layerOrder: [...state.layerOrder]
        }
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
        state: {
          layerSettings: {...state.layerSettings, [payload.id]: {...state.layerSettings[payload.id]}}        }
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
      return {
        ...state,
        activeLayer: payload,
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
      undoData = {state: { colorSettings: {...state.colorSettings} }}
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

    default:
      return state;
  }
};

export default mainReducer;
