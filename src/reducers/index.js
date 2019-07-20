import {
  CREATE_LAYER,
  DELETE_LAYER,
  HIDE_LAYER,
  UPDATE_LAYER_DATA,
  UPDATE_LAYER_QUEUE,
  CLEAR_LAYER_QUEUE,
  UPDATE_LAYER_OPACITY,
  UPDATE_LAYER_ORDER,
  CARD_DRAGOVER,
  MAKE_ACTIVE_LAYER,
  MAKE_ACTIVE_TOOL,
  UPDATE_TOOL_SETTINGS,
  UPDATE_COLOR
} from "../actions";

const initialState = {
  workspaceSettings: {
    width: 500,
    height: 500
  },
  colorSettings: {
    primary: "rgba(0, 0, 0, 1)",
    secondary: "rgba(255, 255, 255, 1)"
  },
  toolSettings: {
    pencil: { name: "Pencil", width: 5, opacity: 1 },
    line: { name: "Line", width: 5, opacity: 1 },
    fillRect: { name: "Fill Rectangle", width: 5, opacity: 1 },
    drawRect: { name: "Draw Rectangle", width: 5, opacity: 1 },
    eraser: { name: "Eraser", width: 5, opacity: 0 },
    eyeDropper: { name: "Eye Dropper", width: "", opacity: "" },
    selectRect: { name: "Select Rectangle", width: "", opacity: "" },
    move: { name: "Move", width: "", opacity: "" }
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
      let { position, staging } = action.payload;
      let canvas = document.createElement("canvas");
      canvas.width = state.workspaceSettings.width;
      canvas.height = state.workspaceSettings.height;
      const newLayer = {
        id: staging ? `staging` : state.layerCounter,
        name: staging ? undefined : `layer ${state.layerCounter}`,
        data: canvas,
        hidden: false,
        opacity: 1,
        queue: null,
        ctx: canvas.getContext("2d")
      };
      let orderAfterCreate = state.layerOrder.slice(0);
      orderAfterCreate.splice(position, 0, newLayer.id);
      return {
        ...state,
        layers: [...state.layers, newLayer],
        layerOrder: orderAfterCreate,
        activeLayer: staging ? state.activeLayer : state.layerCounter,
        layerCounter: staging ? state.layerCounter : state.layerCounter + 1,
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
        let afterUpdateData = state.layers.map(layer => {
          let { id, changes } = action.payload;
          if (layer.id === id) {
            layer.data = changes;
            layer.ctx = changes.getContext('2d');
          }
          return layer;
        });
        return {
          ...state,
          layers: afterUpdateData
        };

    case UPDATE_LAYER_QUEUE:
      let afterUpdate = state.layers.map(layer => {
        let { id, changes } = action.payload;
        if (layer.id === id) {
          layer.queue = changes;
        }
        return layer;
      });
      return {
        ...state,
        layers: afterUpdate
      };
    
    case CLEAR_LAYER_QUEUE:
      let afterQueueClear = state.layers.map(layer => {
        if (layer.id === action.payload) {
          layer.queue = {update: null, get: null}
        }
        return layer;
      });
      return {
        ...state,
        layers: afterQueueClear
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

    case UPDATE_COLOR:
      let { key, value } = action.payload;
      return {
        ...state,
        colorSettings: {
          ...state.colorSettings,
          [key]: value
        }
      };

    default:
      return state;
  }
};

export default rootReducer;
