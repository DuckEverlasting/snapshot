export const [
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
  DRAG_LAYERCARD,
  END_DRAG_LAYERCARD,
  MAKE_ACTIVE_LAYER,
  MAKE_ACTIVE_TOOL,
  UPDATE_TOOL_SETTINGS,
  UPDATE_COLOR,
  UPDATE_WORKSPACE_SETTINGS
] = [
  "CREATE_LAYER",
  "DELETE_LAYER",
  "HIDE_LAYER",
  "UPDATE_LAYER_DATA",
  "UPDATE_LAYER_QUEUE",
  "UPDATE_SELECTION_PATH",
  "UPDATE_LAYER_OPACITY",
  "UPDATE_LAYER_ORDER",
  "ENABLE_LAYER_RENAME",
  "UPDATE_LAYER_NAME",
  "DRAG_LAYERCARD",
  "END_DRAG_LAYERCARD",
  "MAKE_ACTIVE_LAYER",
  "MAKE_ACTIVE_TOOL",
  "UPDATE_TOOL_SETTINGS",
  "UPDATE_COLOR",
  "UPDATE_WORKSPACE_SETTINGS"
];

export const createLayer = (position, special = null, ignoreHistory = false) => {
  return {
    type: CREATE_LAYER,
    payload: {position, special, ignoreHistory}
  };
};

export const deleteLayer = (id, ignoreHistory = false) => {
  return {
    type: DELETE_LAYER,
    payload: {id, ignoreHistory}
  };
};

export const hideLayer = id => {
  return {
    type: HIDE_LAYER,
    payload: id
  };
};

export const updateLayerData = (id, changes, prevImgData, ignoreHistory = false) => {
  return {
    type: UPDATE_LAYER_DATA,
    payload: {id, changes, prevImgData, ignoreHistory}
  };
};

export const updateLayerQueue = (id, changes) => {
  return {
    type: UPDATE_LAYER_QUEUE,
    payload: {id, changes, ignoreHistory: true}
  };
};

export const updateSelectionPath = path => {
  return {
    type: UPDATE_SELECTION_PATH,
    payload: path
  };
};

export const updateLayerOpacity = (id, opacity) => {
  return {
    type: UPDATE_LAYER_OPACITY,
    payload: {id, opacity}
  };
};

export const updateLayerOrder = (from, to) => {
  return {
    type: UPDATE_LAYER_ORDER,
    payload: {from, to}
  };
};

export const enableLayerRename = id => {
  return {
    type: ENABLE_LAYER_RENAME,
    payload: {id, ignoreHistory: true}
  };
};

export const updateLayerName = (id, name) => {
  return {
    type: UPDATE_LAYER_NAME,
    payload: {id, name}
  };
};

export const dragLayercard = position => {
  return {
    type: DRAG_LAYERCARD,
    payload: position
  };
}

export const endDragLayercard = () => {
  return {
    type: END_DRAG_LAYERCARD
  };
}

export const makeActiveLayer = layerId => {
  return {
    type: MAKE_ACTIVE_LAYER,
    payload: {layerId, ignoreHistory: true}
  };
};

export const makeActiveTool = slug => {
  return {
    type: MAKE_ACTIVE_TOOL,
    payload: slug
  };
};

export const updateToolSettings = (tool, changes) => {
  return {
    type: UPDATE_TOOL_SETTINGS,
    payload: {tool, changes}
  };
};

export const updateColor = (key, value) => {
  return {
    type: UPDATE_COLOR,
    payload: {key, value}
  };
};

export const updateWorkspaceSettings = (changes) => {
  return {
    type: UPDATE_WORKSPACE_SETTINGS,
    payload: changes
  }
}
