import {
  CREATE_LAYER,
  DELETE_LAYER,
  HIDE_LAYER,
  UPDATE_SELECTION_PATH,
  UPDATE_LAYER_OPACITY,
  UPDATE_LAYER_BLEND_MODE,
  UPDATE_RENDER_ORDER,
  UPDATE_LAYER_POSITION,
  SET_ENABLE_LAYER_RENAME,
  UPDATE_LAYER_NAME,
  MAKE_ACTIVE_LAYER,
  UPDATE_DOCUMENT_SETTINGS,
  // MOVE_ALL_LAYERS,
  SET_HISTORY_IS_DISABLED
} from "../../actions/redux/types";

import undoable from "./undoable";
import { MarchingSquaresAllPaths } from "../../../utils/marchingSquaresAllPaths";
import { getCanvas, isCanvas } from "../../../utils/helpers";

const projectReducer = (state = {}, {type, payload}) => {
  switch (type) {
    case CREATE_LAYER:
      let { position, source, params } = payload;
      if (state.renderOrder.length >= 50) {
        return state
      };
      if (position === "top") {
        position = state.renderOrder.length;
      }
     
      const layerId = state.layerCounter;
      const newLayerSettings = {
        name: params.name ? params.name : `Layer ${state.layerCounter}`,
        type: "raster",
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
        opacity: 100,
        blend: "source-over"
      };
      const newLayerCanvas = getCanvas(newLayerSettings.size.w, newLayerSettings.size.h, { willReadFrequently: true, desynchronized: true });
      let orderAfterCreate = state.renderOrder.slice(0);
      orderAfterCreate.splice(position + 1, 0, layerId);

      return {
        ...state,
        layerCanvas: {...state.layerCanvas, [layerId]: source ? source : newLayerCanvas},
        layerSettings: {...state.layerSettings, [layerId]: newLayerSettings},
        renderOrder: orderAfterCreate,
        activeLayer: state.layerCounter,
        layerCounter: state.layerCounter + 1,
      };
    
    case DELETE_LAYER:
      let afterDeleteData = {...state.layerCanvas, [payload.id]: undefined}
      let afterDeleteSettings = {...state.layerSettings, [payload.id]: undefined}
      let afterDeleteOrder = state.renderOrder.filter(id => {
        return id !== payload.id;
      });
      let afterDeleteActive = state.activeLayer === payload.id ? null : state.activeLayer
      return {
        ...state,
        layerCanvas: afterDeleteData,
        layerSettings: afterDeleteSettings,
        renderOrder: afterDeleteOrder,
        activeLayer: afterDeleteActive
      };
    
    case HIDE_LAYER:
      let afterHiddenSettings = {
        ...state.layerSettings, 
        [payload.id]: {
          ...state.layerSettings[payload.id],
          hidden: !state.layerSettings[payload.id].hidden,
        }
      }
      
      let activeLayer = state.activeLayer;
      if (activeLayer === payload.id) activeLayer = null;
      return {
        ...state,
        layerSettings: afterHiddenSettings,
        activeLayer
      }

    case UPDATE_SELECTION_PATH:
      let newPath, selectionIsActive, newPreviousSelection;

      function getDefaultPath() {
        const defaultPath = new Path2D();
        defaultPath.rect(0, 0, state.documentSettings.documentWidth, state.documentSettings.documentHeight);
        return defaultPath;
      }

      function getMaskCanvas(width, height, operation, path, changes) {
        const operationList = {
          add: "source-over",
          new: "copy",
          remove: "destination-out",
          intersect: "destination-in"
        }
        const oldCanvas = getCanvas(width, height);
        const oldCtx = oldCanvas.getContext("2d");
        let newCanvas;
        if (isCanvas(changes)) {
          newCanvas = changes;
        } else if (changes instanceof Path2D) {
          newCanvas = getCanvas(width, height);
          const newCtx = newCanvas.getContext("2d");
          newCtx.save();
          newCtx.clip(changes);
          newCtx.fillStyle = "rgba(0,0,0,1)";
          newCtx.rect(0, 0, width, height);
          newCtx.fill();
          newCtx.restore();
        }

        if (path) {
          oldCtx.save();
          oldCtx.clip(path);
          oldCtx.fillStyle = "rgba(0,0,0,1)";
          oldCtx.rect(0, 0, width, height);
          oldCtx.fill();
          oldCtx.restore();
          oldCtx.save();
          oldCtx.globalCompositeOperation = operationList[operation];
          oldCtx.drawImage(newCanvas, 0, 0);
          oldCtx.restore();
          return oldCanvas;
        } else {
          return newCanvas;
        }
      }
      
      if (payload.operation === "clear") {
        newPath = getDefaultPath();
        selectionIsActive = false;
        newPreviousSelection = state.selectionPath;
      } else {
        const maskCanvas = getMaskCanvas(
          state.documentSettings.documentWidth, 
          state.documentSettings.documentHeight,
          payload.operation,
          state.selectionActive ? new Path2D(state.selectionPath) : null,
          payload.changes
        );

        const paths = MarchingSquaresAllPaths.getAllOutlinePaths(maskCanvas);

        if (!paths.length) {
          newPath = getDefaultPath();
          selectionIsActive = false;
          newPreviousSelection = state.selectionPath;
        } else {
          newPath = new Path2D();
          paths.forEach(path => {
            newPath.addPath(path)
          });
          selectionIsActive = true;
          newPreviousSelection = null;
        }
      }

      return {
        ...state,
        selectionPath: newPath,
        selectionActive: selectionIsActive,
        previousSelection: newPreviousSelection
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
    
    case UPDATE_LAYER_BLEND_MODE:
      return {
        ...state,
        layerSettings: {
          ...state.layerSettings, 
          [payload.id]: {
            ...state.layerSettings[payload.id],
            blend: payload.blend,
          }
        }
      };

    case UPDATE_RENDER_ORDER:
      let { from, to } = payload;
      let newRenderOrder = state.renderOrder.slice(0);
      newRenderOrder.splice(to, 0, newRenderOrder.splice(from, 1)[0]);
      return {
        ...state,
        renderOrder: newRenderOrder,
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

    case SET_ENABLE_LAYER_RENAME:
      let afterEnableSettings =  {
        ...state.layerSettings, 
        [payload.id]: {
          ...state.layerSettings[payload.id],
          nameEditable: payload.renamable
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
    
    case UPDATE_DOCUMENT_SETTINGS:
      return {
        ...state,
        documentSettings: {
          ...state.documentSettings,
          ...payload.changes
        }
      };

    // case MOVE_ALL_LAYERS:
    //   const newOffsetLayerSettings = {};
    //   state.renderOrder.forEach(el => {
    //     newOffsetLayerSettings[el] = {
    //       ...state.layerSettings[el],
    //       offset: {
    //         x: state.layerSettings[el].offset.x + payload.offsetDelta.x,
    //         y: state.layerSettings[el].offset.y + payload.offsetDelta.y
    //       }
    //     }
    //   });
    //   return {
    //     ...state,
    //     layerSettings: {
    //       ...state.layerSettings,
    //       ...newOffsetLayerSettings
    //     }
    //   };
        
    case SET_HISTORY_IS_DISABLED:
      return {
        ...state,
        historyIsDisabled: payload.bool
      };

    default:
      return state;
  }
};

const undoableProjectReducer = undoable(projectReducer, {
  filter: (action, state) => action.payload.params && !action.payload.params.ignoreHistory && !state.present.historyIsDisabled,
  limit: 20
});

export default undoableProjectReducer;
