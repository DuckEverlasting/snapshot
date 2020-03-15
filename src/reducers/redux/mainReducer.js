import {
  CREATE_LAYER,
  DELETE_LAYER,
  HIDE_LAYER,
  UPDATE_LAYER_DATA,
  UPDATE_LAYER_QUEUE,
  UPDATE_SELECTION_PATH,
  UPDATE_LAYER_OPACITY,
  UPDATE_LAYER_ORDER,
  ENABLE_LAYER_RENAME,
  UPDATE_LAYER_NAME,
  MAKE_ACTIVE_LAYER,
} from "../../actions/redux";

import { initMainState } from "./initState";

const mainReducer = (state = initMainState, {type, payload}) => {
  switch (type) {
    case CREATE_LAYER:
      let { position, special } = payload;
      if (state.layerOrder.length > 51 && !special) {
        return state
      };
      let canvas = document.createElement("canvas");
      canvas.width = state.documentSettings.canvasWidth;
      canvas.height = state.documentSettings.canvasHeight;
      canvas.getContext("2d").imageSmoothingEnabled = false;
      const layerID = special ? special : state.layerCounter;
      const newLayerData = canvas;
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
        layerQueue: {...state.layerQueue, [layerID]: null},
        layerSettings: {...state.layerSettings, [layerID]: newLayerSettings},
        layerOrder: orderAfterCreate,
        activeLayer: special ? state.activeLayer : state.layerCounter,
        layerCounter: special ? state.layerCounter : state.layerCounter + 1,
      };
    
    case DELETE_LAYER:
      let afterDeleteData = {...state.layerData, [payload.id]: undefined}
      let afterDeleteQueue = {...state.layerQueue, [payload.id]: undefined}
      let afterDeleteSettings = {...state.layerSettings, [payload.id]: undefined}
      let afterDeleteOrder = state.layerOrder.filter(id => {
        return id !== payload.id;
      });
      let afterDeleteActive = state.activeLayer === payload.id ? null : state.activeLayer
      return {
        ...state,
        layerData: afterDeleteData,
        layerQueue: afterDeleteQueue,
        layerSettings: afterDeleteSettings,
        layerOrder: afterDeleteOrder,
        activeLayer: afterDeleteActive
      };
    
    case HIDE_LAYER:
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
        activeLayer
      }

    case UPDATE_LAYER_DATA:
      let afterUpdateData = {
        ...state.layerData, 
        [payload.id]: payload.changes
      }
      let clearedQueue = {
        ...state.layerQueue, 
        [payload.id]: payload.ignoreHistory ? state.layerQueue[payload.id] : null
      }
      
      return {
        ...state,
        layerData: afterUpdateData,
        layerQueue: clearedQueue
      };

    case UPDATE_LAYER_QUEUE:
      let afterUpdateQueue = {
        ...state.layerQueue, 
        [payload.id]: payload.changes,
      }
      
      return {
        ...state,
        layerQueue: afterUpdateQueue
      };
    
    case UPDATE_SELECTION_PATH:
      return {
        ...state,
        selectionPath: payload,
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
        layerSettings: afterOpacitySettings,
      };

    case UPDATE_LAYER_ORDER:
      let { from, to } = payload;
      let newLayerOrder = state.layerOrder.slice(0);
      newLayerOrder.splice(to, 0, newLayerOrder.splice(from, 1)[0]);
      return {
        ...state,
        layerOrder: newLayerOrder,
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
        layerSettings: afterRenameSettings,
      };

    case MAKE_ACTIVE_LAYER:
      return {
        ...state,
        activeLayer: payload.layerId,
      };

    default:
      return state;
  }
};

export default mainReducer;
