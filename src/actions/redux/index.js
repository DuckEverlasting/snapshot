import { getDiff } from "../custom/ctxActions";

export const [
  UNDO,
  REDO,
  PUT_HISTORY_DATA,
  PUT_HISTORY_DATA_MULTIPLE,
  CREATE_LAYER,
  CREATE_LAYER_FROM,
  DELETE_LAYER,
  HIDE_LAYER,
  UPDATE_LAYER_DATA,
  UPDATE_SELECTION_PATH,
  SET_TRANSFORM_SELECTION,
  SET_TRANSFORM_PARAMS,
  UPDATE_LAYER_OPACITY,
  UPDATE_LAYER_ORDER,
  UPDATE_LAYER_POSITION,
  UPDATE_STAGING_POSITION,
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
  TOGGLE_ABOUT_MODAL,
  TOGGLE_HELP,
  SET_HELP_TOPIC,
  SET_FILTER_TOOL,
  SET_IMPORT_IMAGE_FILE,
  SET_EXPORT_OPTIONS
] = [
  "UNDO",
  "REDO",
  "PUT_HISTORY_DATA",
  "PUT_HISTORY_DATA_MULTIPLE",
  "CREATE_LAYER",
  "CREATE_LAYER_FROM",
  "DELETE_LAYER",
  "HIDE_LAYER",
  "UPDATE_LAYER_DATA",
  "UPDATE_SELECTION_PATH",
  "SET_TRANSFORM_SELECTION",
  "SET_TRANSFORM_PARAMS",
  "UPDATE_LAYER_OPACITY",
  "UPDATE_LAYER_ORDER",
  "UPDATE_LAYER_POSITION",
  "UPDATE_STAGING_POSITION",
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
  "TOGGLE_ABOUT_MODAL",
  "TOGGLE_HELP",
  "SET_HELP_TOPIC",
  "SET_FILTER_TOOL",
  "SET_IMPORT_IMAGE_FILE",
  "SET_EXPORT_OPTIONS"
];

export const undo = () => {
  return async (dispatch, getState) => {
    const prevState = getState().main.past[getState().main.past.length - 1]
    if (prevState && prevState.onUndo) {
      if (prevState.onUndo.length) {
        prevState.onUndo.forEach(el => executeUndo(el));
      } else {
        executeUndo(prevState.onUndo);
      }

      function executeUndo(onUndo) {
        const ctx = prevState.layerData[onUndo.id].getContext("2d")
        const changeData = onUndo.data
        const viewWidth = Math.floor(ctx.canvas.width);
        const viewHeight = Math.floor(ctx.canvas.height);
        const imgData = ctx.getImageData(
          0,
          0,
          viewWidth,
          viewHeight
        );
        for (let index in changeData) {
          imgData.data[index] = changeData[index];
        }
        ctx.putImageData(imgData, 0, 0);
      }
    }
    await dispatch({type: UNDO})
    if (prevState && prevState.historyParams && prevState.historyParams.groupWithPrevious) {
      dispatch(undo());
    }
  };
};

export const redo = () => {
  return (dispatch, getState) => {
    const currState = getState().main.present;
    const nextState = getState().main.future[0];
    if (currState && currState.onRedo) {
      if (currState.onRedo.length) {
        currState.onRedo.forEach(el => executeRedo(el));
      } else {
        executeRedo(currState.onRedo);
      }

      function executeRedo(onRedo) {
        const ctx = currState.layerData[onRedo.id].getContext("2d")
        const changeData = onRedo.data
        const viewWidth = Math.floor(ctx.canvas.width);
        const viewHeight = Math.floor(ctx.canvas.height);
        const imgData = ctx.getImageData(
          0,
          0,
          viewWidth,
          viewHeight
        );
        for (let index in changeData) {
          imgData.data[index] = changeData[index];
        }
        ctx.putImageData(imgData, 0, 0);
      }
    }
    dispatch({type: REDO})
    if (nextState && nextState.historyParams && nextState.historyParams.groupWithPrevious) {
      dispatch(redo());
    }
  };
}

export const putHistoryData = (id, ctx, callback, prevImgData, params) => {
  const viewWidth = Math.floor(ctx.canvas.width);
  const viewHeight = Math.floor(ctx.canvas.height);
  if (!prevImgData) {
    prevImgData = ctx.getImageData(
      0,
      0,
      viewWidth,
      viewHeight
    );
    callback();
  }
  return {
    type: PUT_HISTORY_DATA,
    payload: {id, ...getDiff(ctx, {prevImgData}), params}
  }
}

export const putHistoryDataMultiple = (ids, ctxs, callbacks=[], prevImgDatas=[], params) => {
  let differences = [];
  for (let i = 0; i < ids.length; i++) {
    const viewWidth = Math.floor(ctxs[i].canvas.width);
    const viewHeight = Math.floor(ctxs[i].canvas.height);
    if (!prevImgDatas[i]) {
      prevImgDatas[i] = ctxs[i].getImageData(
        0,
        0,
        viewWidth,
        viewHeight
      );
      callbacks[i]();
    }
    differences[i] = {
      id: ids[i],
      ...getDiff(ctxs[i], {prevImgData: prevImgDatas[i]}),
      params
    }
  }
  
  return {
    type: PUT_HISTORY_DATA_MULTIPLE,
    payload: differences
  }
}

export const createLayer = (position, ignoreHistory=false, params={}) => {
  return {
    type: CREATE_LAYER,
    payload: {position, ignoreHistory, params}
  };
};

export const createLayerFrom = (position, source, ignoreHistory=false, params={}) => {
  return {
    type: CREATE_LAYER,
    payload: {position, source, ignoreHistory, params}
  };
};

export const deleteLayer = (id, ignoreHistory=false) => {
  return (dispatch, getState) => {
    let data = null;
    if (!ignoreHistory) {
      const ctx = getState().main.present.layerData[id].getContext("2d");
      const viewWidth = Math.floor(ctx.canvas.width);
      const viewHeight = Math.floor(ctx.canvas.height);
      data = ctx.getImageData(
        0,
        0,
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

export const updateLayerData = (id, changes, ignoreHistory=true) => {
  return {
    type: UPDATE_LAYER_DATA,
    payload: {id, changes, ignoreHistory}
  };
};

export const updateSelectionPath = path => {
  return {
    type: UPDATE_SELECTION_PATH,
    payload: {path, ignoreHistory: true}
  };
};

const defaultTransformParams = {
  startEvent: null,
  rotatable: null,
  resizable: null
}

export const setTransformSelection = (target, params=defaultTransformParams, ignoreHistory=true) => {
  return {
    type: SET_TRANSFORM_SELECTION,
    payload: {
      params: params ? params : defaultTransformParams,
      target,
      ignoreHistory
    }
  };
};

export const setTransformParams = (params=defaultTransformParams, ignoreHistory=true) => {
  return {
    type: SET_TRANSFORM_PARAMS,
    payload: {
      params: params ? params : defaultTransformParams,
      ignoreHistory
    }
  };
};

export const updateLayerOpacity = (id, opacity, ignoreHistory=false) => {
  return {
    type: UPDATE_LAYER_OPACITY,
    payload: {id, opacity, ignoreHistory}
  };
};

export const updateLayerOrder = (from, to, ignoreHistory=false) => {
  return {
    type: UPDATE_LAYER_ORDER,
    payload: {from, to, ignoreHistory}
  };
};

export const updateLayerPosition = (id, size, offset, ignoreHistory=false) => {
  return {
    type: UPDATE_LAYER_POSITION,
    payload: {id, size, offset, ignoreHistory}
  };
};

export const updateStagingPosition = id => {
  return {
    type: UPDATE_STAGING_POSITION,
    payload: {id, ignoreHistory: true}
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

export const toggleHelp = topic => {
  return {
    type: TOGGLE_HELP,
    payload: topic
  }
}

export const setHelpTopic = (topic=null) => {
  return {
    type: SET_HELP_TOPIC,
    payload: topic
  }
}

export const setFilterTool = (state, filter=null) => {
  return {
    type: SET_FILTER_TOOL,
    payload: {
      bool: state === "on",
      filter
    }
  }
}

export const setImportImageFile = (file) => {
  return {
    type: SET_IMPORT_IMAGE_FILE,
    payload: file
  }
}

export const setExportOptions = (type=null, compression=null) => {
  return {
    type: SET_EXPORT_OPTIONS,
    payload: { type, compression }
  }
}
