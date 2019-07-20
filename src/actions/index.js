export const [
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
] = [
  "CREATE_LAYER",
  "DELETE_LAYER",
  "HIDE_LAYER",
  "UPDATE_LAYER_DATA",
  "UPDATE_LAYER_QUEUE",
  "CLEAR_LAYER_QUEUE",
  "UPDATE_LAYER_OPACITY",
  "UPDATE_LAYER_ORDER",
  "CARD_DRAGOVER",
  "MAKE_ACTIVE_LAYER",
  "MAKE_ACTIVE_TOOL",
  "UPDATE_TOOL_SETTINGS",
  "UPDATE_COLOR"
];

export const createLayer = (position, staging = false) => {
  return {
    type: CREATE_LAYER,
    payload: {position, staging}
  };
};

export const deleteLayer = id => {
  return {
    type: DELETE_LAYER,
    payload: id
  };
};

export const hideLayer = id => {
  return {
    type: HIDE_LAYER,
    payload: id
  };
};

export const updateLayerData = (id, changes) => {
  return {
    type: UPDATE_LAYER_DATA,
    payload: {id, changes}
  };
};

export const updateLayerQueue = (id, changes) => {
  return {
    type: UPDATE_LAYER_QUEUE,
    payload: {id, changes}
  };
};

export const clearLayerQueue = id => {
  return {
    type: CLEAR_LAYER_QUEUE,
    payload: id
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

export const layerCardDragover = position => {
  return {
    type: CARD_DRAGOVER,
    payload: position
  };
}

export const makeActiveLayer = layerId => {
  return {
    type: MAKE_ACTIVE_LAYER,
    payload: layerId
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
