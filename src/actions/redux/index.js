import { getDiff } from "../custom/ctxActions";

export const [
  UNDO,
  REDO,
  PUT_HISTORY_DATA,
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
  SET_ACTIVE_MENU_LIST,
  SET_CLIPBOARD_IS_USED,
  TOGGLE_ABOUT_MODAL
] = [
  "UNDO",
  "REDO",
  "PUT_HISTORY_DATA",
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
  "SET_ACTIVE_MENU_LIST",
  "SET_CLIPBOARD_IS_USED",
  "TOGGLE_ABOUT_MODAL"
];

export const undo = () => {
  return (dispatch, getState) => {
    const prevState = getState().main.past[getState().main.past.length - 1] 
    if (prevState && prevState.onUndo) {
      const ctx = prevState.layerData[prevState.onUndo.id].getContext("2d")
      const changeData = prevState.onUndo.data
      const viewWidth = Math.ceil(ctx.canvas.width / 3);
      const viewHeight = Math.ceil(ctx.canvas.height / 3);
      const imgData = ctx.getImageData(
        viewWidth,
        viewHeight,
        viewWidth,
        viewHeight
      );
      for (let index in changeData) {
        imgData.data[index] = changeData[index];
      }
      ctx.putImageData(imgData, viewWidth, viewHeight);
    }
    dispatch({type: UNDO})
  };
};

export const redo = () => {
  return (dispatch, getState) => {
    const currState = getState().main.present 
    if (currState && currState.onRedo) {
      console.log(currState)
      const ctx = currState.layerData[currState.onRedo.id].getContext("2d")
      const changeData = currState.onRedo.data
      const viewWidth = Math.ceil(ctx.canvas.width / 3);
      const viewHeight = Math.ceil(ctx.canvas.height / 3);
      const imgData = ctx.getImageData(
        viewWidth,
        viewHeight,
        viewWidth,
        viewHeight
      );
      for (let index in changeData) {
        imgData.data[index] = changeData[index];
      }
      ctx.putImageData(imgData, viewWidth, viewHeight);
    }
    dispatch({type: REDO})
  };
}

export const putHistoryData = (id, ctx, callback, prevImgData) => {
  const viewWidth = Math.ceil(ctx.canvas.width / 3);
  const viewHeight = Math.ceil(ctx.canvas.height / 3);
  if (!prevImgData) {
    prevImgData = ctx.getImageData(
      viewWidth,
      viewHeight,
      viewWidth,
      viewHeight
    );
    callback();
  }
  return {
    type: PUT_HISTORY_DATA,
    payload: {id, ...getDiff(ctx, {prevImgData})}
  }
}

export const createLayer = (position, special = null, ignoreHistory = false) => {
  return {
    type: CREATE_LAYER,
    payload: {position, special, ignoreHistory}
  };
};

export const deleteLayer = (id, ignoreHistory = false) => {
  return (dispatch, getState) => {
    let data = null;
    if (!ignoreHistory) {
      const ctx = getState().main.present.layerData[id].getContext("2d");
      const viewWidth = Math.ceil(ctx.canvas.width / 3);
      const viewHeight = Math.ceil(ctx.canvas.height / 3);
      data = ctx.getImageData(
        viewWidth,
        viewHeight,
        viewWidth,
        viewHeight
      );
    }
    dispatch({
      type: DELETE_LAYER,
      payload: {id, data, ignoreHistory}
    });
  } 
};

export const hideLayer = id => {
  return {
    type: HIDE_LAYER,
    payload: id
  };
};

export const updateLayerData = (id, changes, ignoreHistory = true) => {
  return {
    type: UPDATE_LAYER_DATA,
    payload: {id, changes, ignoreHistory}
  };
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

export const setClipboardIsUsed = bool => {
  return {
    type: SET_CLIPBOARD_IS_USED,
    payload: {bool, ignoreHistory: true}
  }
}

export const toggleAboutModal = () => {
  return {
    type: TOGGLE_ABOUT_MODAL
  }
}

