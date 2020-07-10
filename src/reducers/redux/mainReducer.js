import {
  CREATE_LAYER,
  DELETE_LAYER,
  HIDE_LAYER,
  UPDATE_CANVAS,
  UPDATE_SELECTION_PATH,
  UPDATE_LAYER_OPACITY,
  UPDATE_LAYER_BLEND_MODE,
  UPDATE_RENDER_ORDER,
  UPDATE_LAYER_POSITION,
  UPDATE_STAGING_POSITION,
  ENABLE_LAYER_RENAME,
  UPDATE_LAYER_NAME,
  MAKE_ACTIVE_LAYER,
  SET_STAMP_DATA,
  UPDATE_DOCUMENT_SETTINGS,
  MOVE_ALL_LAYERS,
  SET_HISTORY_IS_DISABLED
} from "../../actions/redux";

import { getInitMainState } from "./initState";
import { MarchingSquaresOpt } from "../../utils/marchingSquares";

const mainReducer = (state = getInitMainState(), {type, payload}) => {
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
      const newLayerCanvas = new OffscreenCanvas(newLayerSettings.size.w, newLayerSettings.size.h);
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

    case UPDATE_CANVAS:
      return {
        ...state,
        layerCanvas: {
          ...state.layerCanvas,
          [payload.id]: payload.changes
        }
      };

    case UPDATE_SELECTION_PATH:
      let newPath, selectionIsActive;

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
        const oldCanvas = new OffscreenCanvas(width, height);
        const oldCtx = oldCanvas.getContext("2d");
        const newCanvas = new OffscreenCanvas(width, height);
        const newCtx = newCanvas.getContext("2d");
        newCtx.save();
        newCtx.clip(changes);
        newCtx.fillStyle = "rgba(0,255,0,1)";
        newCtx.rect(0, 0, width, height);
        newCtx.fill();
        newCtx.restore();

        if (path) {
          oldCtx.save();
          oldCtx.clip(path);
          oldCtx.fillStyle = "rgba(0,255,0,1)";
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
        // oldCtx.save();
        // oldCtx.fillStyle = "rgba(255,0,0,1)";
        // oldCtx.beginPath();
        // oldCtx.rect(0, 0, width, height);
        // if (path) {
        //   ctx.save();
        //   ctx.fillStyle = "rgba(0,255,0,1)";
        //   ctx.clip(path);
        //   ctx.fill();
        //   ctx.restore();
        // }
        // ctx.clip(changes);
        // ctx.globalCompositeOperation = operationList[operation];
        // ctx.fill();
        // ctx.restore();
        // return canvas;
      }

      function findOutline(canvas, pointList, prevLength=null, finalPath=null) {
        if (!finalPath) {
          finalPath = new Path2D();
        }
        const ctx = canvas.getContext("2d");
        let path = MarchingSquaresOpt.getPathFromPointList(pointList);
        finalPath.addPath(path);
        ctx.save();
        ctx.clip(path);
        ctx.clearRect(0, 0, state.documentSettings.documentWidth, state.documentSettings.documentHeight);
        ctx.restore();
        const nextPointList = MarchingSquaresOpt.getBlobOutlinePoints(ctx.canvas);
        if (nextPointList.length && nextPointList.length !== prevLength) {
          const nextPrevLength = nextPointList.length;
          return findOutline(canvas, nextPointList, nextPrevLength, finalPath);
        } else {
          canvas = null;
          return finalPath;
        }
      }
      
      if (payload.operation === "clear") {
        newPath = getDefaultPath();
        selectionIsActive = false;
      } else {
        const maskCanvas = getMaskCanvas(
          state.layerCanvas.main.width, 
          state.layerCanvas.main.height, 
          payload.operation,
          state.selectionActive ? new Path2D(state.selectionPath) : null,
          new Path2D(payload.path)
        );
        // state.layerCanvas.selection.getContext("2d").clearRect(0, 0, state.layerCanvas.main.width, state.layerCanvas.main.height);
        // state.layerCanvas.selection.getContext("2d").drawImage(maskCanvas, 0, 0);

        function convolve(data, width) {
          const matrixPattern = [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]];
          const pointList = [];
        
          function getMatrixAt(data, width, index) {
            const matrix = new Array(3);
            const row = new Array(3);
            const originX = (index / 4) % width;
            for (let i = 0; i < 3; i++) {
              matrix[i] = [...row];
              const y = i - 1;
              for (let j = 0; j < 3; j++) {
                const x = j - 1;
                const newIndex = index + x * width * 4 + y * 4;
                if (
                  data[newIndex] !== undefined &&
                  originX + x >= 0 &&
                  originX + x < width
                ) {
                  matrix[i][j] = data[newIndex];
                } else {
                  matrix[i][j] = data[index];
                }
              }
            }
            return matrix;
          }

          function isEdge(index) {
            const dataMatrix = getMatrixAt(data, width, index);
            let result = 0;
            dataMatrix.forEach((row, rowIndex) => {
              row.forEach((num, colIndex) => {
                result += num * matrixPattern[rowIndex][colIndex]
              });
            });
            return result === 0;
          }
        
          for (let i=0; i<data.length; i+=4) {
            if (isEdge(i+3)) {
              const x = (i / 4) % width, y = Math.floor(i / width);
              pointList.push(x, y);
            };
          }
          return pointList;
        }

        const pointList = MarchingSquaresOpt.getBlobOutlinePoints(maskCanvas);
        if (!pointList.length) {
          newPath = getDefaultPath();
          selectionIsActive = false;
        } else {
          newPath = findOutline(maskCanvas, pointList);
          selectionIsActive = true;
        }
      }

      return {
        ...state,
        selectionPath: newPath,
        selectionActive: selectionIsActive
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
    
    case SET_STAMP_DATA:
      return {
        ...state,
        stampData: {
          ...state.stampData,
          ...payload.changes
        }
      };
    
    case UPDATE_DOCUMENT_SETTINGS:
      return {
        ...state,
        documentSettings: {
          ...state.documentSettings,
          ...payload.changes
        }
      };

    case MOVE_ALL_LAYERS:
      const newOffsetLayerSettings = {};
      state.renderOrder.forEach(el => {
        newOffsetLayerSettings[el] = {
          ...state.layerSettings[el],
          offset: {
            x: state.layerSettings[el].offset.x + payload.offsetDelta.x,
            y: state.layerSettings[el].offset.y + payload.offsetDelta.y
          }
        }
      });
      return {
        ...state,
        layerSettings: {
          ...state.layerSettings,
          ...newOffsetLayerSettings
        }
      };
    
    case SET_HISTORY_IS_DISABLED:
      return {
        ...state,
        historyIsDisabled: payload.bool
      };
      
    default:
      return state;
  }
};

export default mainReducer;
