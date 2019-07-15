import {
  CREATE_LAYER,
  DELETE_LAYER,
  HIDE_LAYER,
  UPDATE_LAYER_DATA,
  UPDATE_LAYER_OPACITY,
  UPDATE_LAYER_ORDER,
  MERGE_LAYERS,
  CARD_DRAGOVER,
  MAKE_ACTIVE_LAYER,
  MAKE_ACTIVE_TOOL,
  UPDATE_TOOL_SETTINGS
} from "../actions";

import draw from "./drawingReducer.js";

const initialState = {
  workspaceSettings: {
    width: 500,
    height: 500
  },
  toolSettings: {
    pencil: { name: "Pencil", color: "#000000", width: 5, opacity: 1 },
    line: { name: "Line", color: "#000000", width: 5, opacity: 1 },
    fillRect: { name: "Fill Rectangle", color: "#000000", width: 5, opacity: 1 },
    drawRect: { name: "Draw Rectangle", color: "#000000", width: 5, opacity: 1 }
  },
  layers: [],
  layerOrder: [],
  cardDragPosition: null,
  activeLayer: null,
  layerCounter: 1,
  activeTool: "pencil"
};

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_LAYER:
      let { position, temp } = action.payload;
      let canvas = document.createElement("canvas");
      canvas.width = state.workspaceSettings.width;
      canvas.height = state.workspaceSettings.height;
      const newLayer = {
        id: temp ? `temp` : state.layerCounter,
        name: temp ? undefined : `layer ${state.layerCounter}`,
        data: canvas,
        hidden: false,
        opacity: 1,
        trigger: 0,
        ctx: canvas.getContext("2d")
      };
      let orderAfterCreate = state.layerOrder.slice(0);
      orderAfterCreate.splice(position, 0, newLayer.id);
      return {
        ...state,
        layers: [...state.layers, newLayer],
        layerOrder: orderAfterCreate,
        activeLayer: temp ? state.activeLayer : state.layerCounter,
        layerCounter: temp ? state.layerCounter : state.layerCounter + 1,
      };

    case DELETE_LAYER:
      let afterDelete = state.layers.filter(layer => {
        return layer.id !== action.payload;
      });
      let afterDeleteOrder = state.layerOrder.filter(id => {
        return id !== action.payload;
      });
      return {
        ...state,
        layers: afterDelete,
        layerOrder: afterDeleteOrder
      };
    
    case HIDE_LAYER:
      let hiddenLayer = state.layers.filter(layer => {
        return layer.id === action.payload
      })[0];
      hiddenLayer.hidden = !hiddenLayer.hidden;
      let activeLayer = state.activeLayer;
      if (activeLayer === action.payload) activeLayer = null;
      return {
        ...state,
        layer: [
          ...state.layers,
          hiddenLayer
        ],
        activeLayer
      }

    case UPDATE_LAYER_DATA:
      let afterUpdate = state.layers.map(layer => {
        let { id, changes } = action.payload;
        if (layer.id === id) {
          if (layer.id === "temp") {
            layer.ctx.clearRect(0, 0, layer.data.width, layer.data.height)
          };
          draw(layer.ctx, changes);
          layer.trigger++;
        }
        return layer;
      });
      return {
        ...state,
        layers: afterUpdate
      };

    case UPDATE_LAYER_OPACITY:
      let afterOpacity = state.layers.map(layer => {
        let { id, opacity } = action.payload;
        if (layer.id === id) {
          layer.opacity = opacity;
        }
        return layer;
      });
      return {
        ...state,
        layers: afterOpacity
      };

    case UPDATE_LAYER_ORDER:
      let { from, to } = action.payload;
      let newLayerOrder = state.layerOrder.slice(0);
      newLayerOrder.splice(to, 0, state.newLayerOrder.splice(from, 1)[0]);
      return {
        ...state,
        layerOrder: newLayerOrder
      };

    case MERGE_LAYERS:
      let { fromLayer, toLayer } = action.payload;
      let fromLayerdata = state.layers.filter(layer => {
        return layer.id === fromLayer;
      })[0].data;
      let afterMerge = state.layers
        .map(layer => {
          if (layer.id === toLayer) {
            layer.ctx.drawImage(fromLayerdata, 0, 0);
            layer.trigger++;
          }
          return layer;
        })
        .filter(layer => {
          return layer.id !== fromLayer;
        });
      let afterMergeOrder = state.layerOrder.filter(id => {
        return id !== fromLayer;
      });
      return {
        ...state,
        layers: afterMerge,
        layerOrder: afterMergeOrder
      };

    case CARD_DRAGOVER:
      return {
        ...state,
        cardDragPosition: action.payload
      };

    case MAKE_ACTIVE_LAYER:
      return {
        ...state,
        activeLayer: action.payload
      };

    case MAKE_ACTIVE_TOOL:
      return {
        ...state,
        activeTool: action.payload
      };

    case UPDATE_TOOL_SETTINGS:
      let { tool, changes } = action.payload;
      return {
        ...state,
        toolSettings: {
          ...state.toolSettings,
          [tool]: changes
        }
      };

    default:
      return state;
  }
};

export default rootReducer;
