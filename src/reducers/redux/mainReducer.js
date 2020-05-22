import {
  CREATE_LAYER,
  DELETE_LAYER,
  HIDE_LAYER,
  UPDATE_LAYER_DATA,
  UPDATE_SELECTION_PATH,
  SET_TRANSFORM_SELECTION,
  UPDATE_LAYER_OPACITY,
  UPDATE_LAYER_ORDER,
  UPDATE_LAYER_POSITION,
  UPDATE_STAGING_POSITION,
  ENABLE_LAYER_RENAME,
  UPDATE_LAYER_NAME,
  MAKE_ACTIVE_LAYER,
} from "../../actions/redux";

import { initMainState } from "./initState";

const mainReducer = (state = initMainState, {type, payload}) => {
  switch (type) {
    case CREATE_LAYER:
      let { position, source, params } = payload;
      if (state.layerOrder.length >= 50) {
        return state
      };
      if (position === "top") {
        position = state.layerOrder.length;
      }
     
      const layerId = state.layerCounter;
      const newLayerSettings = {
        name: params.name ? params.name : `Layer ${state.layerCounter}`,
        nameEditable: false,
        size: params.size || {
          w: state.documentSettings.documentWidth,
          h: state.documentSettings.documentHeight
        },
        offset: params.offset || {
          x: 0,
          y: 0
        },
        hidden: false,
        opacity: 1,
      };
      let orderAfterCreate = state.layerOrder.slice(0);
      orderAfterCreate.splice(position + 1, 0, layerId);

      return {
        ...state,
        layerData: {...state.layerData, [layerId]: source ? source : null},
        layerSettings: {...state.layerSettings, [layerId]: newLayerSettings},
        layerOrder: orderAfterCreate,
        activeLayer: state.layerCounter,
        layerCounter: state.layerCounter + 1,
      };
    
    case DELETE_LAYER:
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
      return {
        ...state,
        layerData: {
          ...state.layerData,
          [payload.id]: payload.changes
        }
      };

    case UPDATE_SELECTION_PATH:
      function getDefaultPath() {
        const defaultPath = new Path2D();
        defaultPath.rect(0, 0, state.documentSettings.documentWidth, state.documentSettings.documentHeight);
        return defaultPath;
      }
      const newPath = payload.path ?
        payload.path :
        getDefaultPath()
      return {
        ...state,
        selectionPath: newPath,
        selectionActive: payload.path
      }

    case SET_TRANSFORM_SELECTION:
      return {
        ...state,
        transformSelectionTarget: payload.target,
        transformParams: {
          ...state.transformParams,
          ...payload.params
        }
      }

    case UPDATE_LAYER_OPACITY:
      return {
        ...state,
        layerSettings: {
          ...state.layerSettings, 
          [payload.id]: {
            ...state.layerSettings[payload.id],
            opacity: payload.opacity,
          }
        }
      };

    case UPDATE_LAYER_ORDER:
      let { from, to } = payload;
      let newLayerOrder = state.layerOrder.slice(0);
      newLayerOrder.splice(to, 0, newLayerOrder.splice(from, 1)[0]);
      return {
        ...state,
        layerOrder: newLayerOrder,
      };

    case UPDATE_LAYER_POSITION:
      return {
        ...state,
        layerSettings: {
          ...state.layerSettings,
          [payload.id]: {
            ...state.layerSettings[payload.id],
            size: payload.size ? payload.size : state.layerSettings[payload.id].size,
            offset: payload.offset ? payload.offset : state.layerSettings[payload.id].offset,
          }
        },
      };
      
    case UPDATE_STAGING_POSITION:
      return {
        ...state,
        stagingPinnedTo: payload.id
      }

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
