import {
  CREATE_LAYER,
  DELETE_LAYER,
  HIDE_LAYER,
  UPDATE_LAYER_DATA,
  UPDATE_LAYER_QUEUE,
  CLEAR_LAYER_QUEUE,
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
} from "../actions";

let selectionCanvas = document.createElement("canvas");
let initCanvas = document.createElement("canvas");
let initWidth = window.innerWidth * .7;
let initHeight = window.innerHeight * .8;
selectionCanvas.width = initWidth;
selectionCanvas.height = initHeight;
initCanvas.width = initWidth;
initCanvas.height = initHeight;

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
  toolSettings: {
    pencil: { name: "Pencil", width: 5, opacity: 1 },
    brush: { name: "Brush", width: 15, opacity: 1 },
    line: { name: "Line", width: 5, opacity: 1 },
    fillRect: { name: "Fill Rectangle", width: null, opacity: 1 },
    drawRect: { name: "Draw Rectangle", width: 5, opacity: 1 },
    fillCirc: { name: "Fill Circle", width: null, opacity: 1 },
    drawCirc: { name: "Draw Circle", width: 5, opacity: 1 },
    eraser: { name: "Eraser", width: 5, opacity: null },
    eyeDropper: { name: "Eye Dropper", width: null, opacity: null },
    selectRect: { name: "Select Rectangle", width: null, opacity: null },
    move: { name: "Move", width: null, opacity: null },
    hand: { name: "Hand", width: null, opacity: null },
    zoom: { name: "Zoom", width: null, opacity: null }
  },
  layers: [
    {
      id: 1,
      name: "layer 1",
      nameEditable: false,
      data: initCanvas,
      hidden: false,
      opacity: 1,
      queue: null,
      ctx: initCanvas.getContext("2d")
    },
    {
      id: "selection",
      name: undefined,
      nameEditable: false,
      data: selectionCanvas,
      hidden: false,
      opacity: 1,
      queue: null,
      ctx: selectionCanvas.getContext("2d")
    },
  ],
  layerOrder: [1, "selection"],
  draggedLayercard: null,
  activeLayer: 1,
  layerCounter: 2,
  activeTool: "pencil"
};

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_LAYER:
      let { position, special } = action.payload;
      let canvas = document.createElement("canvas");
      canvas.width = state.workspaceSettings.canvasWidth;
      canvas.height = state.workspaceSettings.canvasHeight;
      canvas.getContext("2d").imageSmoothingEnabled = false;
      let newLayer = {
        id: special ? special : state.layerCounter,
        name: special ? undefined : `layer ${state.layerCounter}`,
        nameEditable: false,
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
        activeLayer: special ? state.activeLayer : state.layerCounter,
        layerCounter: special ? state.layerCounter : state.layerCounter + 1,
      };
    
    case DELETE_LAYER:
      let afterDelete = state.layers.filter(layer => {
        return layer.id !== action.payload;
      });
      let afterDeleteOrder = state.layerOrder.filter(id => {
        return id !== action.payload;
      });
      let afterDeleteActive = state.activeLayer === action.payload ? null : state.activeLayer
      return {
        ...state,
        layers: afterDelete,
        layerOrder: afterDeleteOrder,
        activeLayer: afterDeleteActive
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
          let { id, changes: layerChanges } = action.payload;
          if (layer.id === id) {
            layer.data = layerChanges;
            layer.ctx = layerChanges.getContext('2d');
          }
          return layer;
        });
        return {
          ...state,
          layers: afterUpdateData
        };

    case UPDATE_LAYER_QUEUE:
      let afterUpdate = state.layers.map(layer => {
        let { id, changes: layerQueueChanges } = action.payload;
        if (layer.id === id) {
          layer.queue = layerQueueChanges;
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
      newLayerOrder.splice(to, 0, newLayerOrder.splice(from, 1)[0]);
      return {
        ...state,
        layerOrder: newLayerOrder
      };

    case ENABLE_LAYER_RENAME:
      let afterEnable = state.layers.map(layer => {
        let id = action.payload;
        if (layer.id === id) {
          layer.nameEditable = true;
        }
        return layer;
      });
      return {
        ...state,
        layers: afterEnable
      };

    case UPDATE_LAYER_NAME:
      let afterRename = state.layers.map(layer => {
        let { id, name } = action.payload;
        if (layer.id === id) {
          layer.name = name;
          layer.nameEditable = false;
        }
        return layer;
      });
      return {
        ...state,
        layers: afterRename
      };

    case DRAG_LAYERCARD:
      return {
        ...state,
        draggedLayercard: action.payload
      };

    case END_DRAG_LAYERCARD:
      return {
        ...state,
        draggedLayercard: null,
      }

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
      let { tool, changes: toolChanges } = action.payload;
      return {
        ...state,
        toolSettings: {
          ...state.toolSettings,
          [tool]: toolChanges
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

    case UPDATE_WORKSPACE_SETTINGS:
      let workspaceSettingsChanges = action.payload;
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
