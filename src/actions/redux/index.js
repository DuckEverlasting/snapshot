import { getDiff } from "../custom/ctxActions";

export const [
  UNDO,
  REDO,
  INSERT_LAYER_HISTORY,
  UPDATE_AFTER_UNDO,
  UPDATE_AFTER_REDO,
  CREATE_LAYER,
  DELETE_LAYER,
  HIDE_LAYER,
  UPDATE_LAYER_DATA,
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
  SWITCH_COLORS,
  UPDATE_WORKSPACE_SETTINGS,
  TOGGLE_MENU,
  SET_ACTIVE_MENU_LIST
] = [
  "UNDO",
  "REDO",
  "INSERT_LAYER_HISTORY",
  "UPDATE_AFTER_UNDO",
  "UPDATE_AFTER_REDO",
  "CREATE_LAYER",
  "DELETE_LAYER",
  "HIDE_LAYER",
  "UPDATE_LAYER_DATA",
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
  "SWITCH_COLORS",
  "UPDATE_WORKSPACE_SETTINGS",
  "TOGGLE_MENU",
  "SET_ACTIVE_MENU_LIST"
];

export const undo = () => {
  return {
    type: UNDO
  };
};

export const redo = () => {
  return {
    type: REDO
  };
};

export const insertLayerHistory = (id, changeData) => {
  return {
    type: INSERT_LAYER_HISTORY,
    payload: {id, changeData}
  }
}

export const updateAfterUndo = (id, changeData) => {
  return {
    type: UPDATE_AFTER_UNDO,
    payload: {id, changeData}
  }
}

export const updateAfterRedo = (id, changeData) => {
  return {
    type: UPDATE_AFTER_REDO,
    payload: {id, changeData}
  }
}

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

export const updateLayerData = (id, changes, ignoreHistory = false, init = false) => {
  return (dispatch, getState) => {
    if (init) {
      return dispatch ({
        type: UPDATE_LAYER_DATA,
        payload: {id, changes, ignoreHistory}
      });
    }
    const prevCtx = getState().main.present.layerData[id].getContext("2d");
    const newCtx = changes.getContext("2d");
    const viewWidth = Math.ceil(prevCtx.canvas.width / 3);
    const viewHeight = Math.ceil(prevCtx.canvas.height / 3);
    const prevImgData = prevCtx.getImageData(
      viewWidth,
      viewHeight,
      viewWidth,
      viewHeight
    );
    const changeData = getDiff(newCtx, {prevImgData});
    dispatch ({
      type: UPDATE_LAYER_DATA,
      payload: {id, changes, changeData, ignoreHistory}
    });
    return dispatch ({
      type: DELETE_LAYER,
      payload: {
        id: "staging",
        ignoreHistory: true
      }
    })
  }
};

export const updateSelectionPath = path => {
  return {
    type: UPDATE_SELECTION_PATH,
    payload: {path, ignoreHistory: false}
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
    payload: {from, to, ignoreHistory: true}
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

export const switchColors = () => {
  return {
    type: SWITCH_COLORS
  };
};

export const updateWorkspaceSettings = (changes) => {
  return {
    type: UPDATE_WORKSPACE_SETTINGS,
    payload: changes
  }
}

export const toggleMenu = () => {
  return {
    type: TOGGLE_MENU
  }
}

export const setActiveMenuList = (id) => {
  return {
    type: SET_ACTIVE_MENU_LIST,
    payload: id
  }
}
