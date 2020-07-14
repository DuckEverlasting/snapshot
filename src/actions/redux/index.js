import { getDiff } from "../custom/ctxActions";
import moveLayer from "../redux/moveLayer";

export const [
  UNDO,
  REDO,
  PUT_HISTORY_DATA,
  PUT_HISTORY_DATA_MULTIPLE,
  CREATE_LAYER,
  CREATE_LAYER_FROM,
  DELETE_LAYER,
  HIDE_LAYER,
  UPDATE_CANVAS,
  UPDATE_SELECTION_PATH,
  SET_TRANSFORM_TARGET,
  SET_TRANSFORM_PARAMS,
  SET_CROP_IS_ACTIVE,
  SET_CROP_PARAMS,
  UPDATE_LAYER_OPACITY,
  UPDATE_LAYER_BLEND_MODE,
  UPDATE_RENDER_ORDER,
  UPDATE_LAYER_POSITION,
  UPDATE_STAGING_POSITION,
  ENABLE_LAYER_RENAME,
  UPDATE_LAYER_NAME,
  DRAG_LAYERCARD,
  END_DRAG_LAYERCARD,
  MAKE_ACTIVE_LAYER,
  SET_ACTIVE_TOOL,
  UPDATE_TOOL_SETTINGS,
  UPDATE_COLOR,
  SWITCH_COLORS,
  UPDATE_WORKSPACE_SETTINGS,
  UPDATE_DOCUMENT_SETTINGS,
  MOVE_ALL_LAYERS,
  SET_CLIPBOARD_IS_USED,
  SET_OVERLAY,
  SET_MENU_IS_DISABLED,
  SET_HISTORY_IS_DISABLED,
  SET_HELP_TOPIC,
  SET_IMPORT_IMAGE_FILE,
  SET_EXPORT_OPTIONS,
  SET_STAMP_DATA,
  SET_APP_IS_WAITING,
  RESET_STATE
] = [
  "UNDO",
  "REDO",
  "PUT_HISTORY_DATA",
  "PUT_HISTORY_DATA_MULTIPLE",
  "CREATE_LAYER",
  "CREATE_LAYER_FROM",
  "DELETE_LAYER",
  "HIDE_LAYER",
  "UPDATE_CANVAS",
  "UPDATE_SELECTION_PATH",
  "SET_TRANSFORM_TARGET",
  "SET_TRANSFORM_PARAMS",
  "SET_CROP_IS_ACTIVE",
  "SET_CROP_PARAMS",
  "UPDATE_LAYER_OPACITY",
  "UPDATE_LAYER_BLEND_MODE",
  "UPDATE_RENDER_ORDER",
  "UPDATE_LAYER_POSITION",
  "UPDATE_STAGING_POSITION",
  "ENABLE_LAYER_RENAME",
  "UPDATE_LAYER_NAME",
  "DRAG_LAYERCARD",
  "END_DRAG_LAYERCARD",
  "MAKE_ACTIVE_LAYER",
  "SET_ACTIVE_TOOL",
  "UPDATE_TOOL_SETTINGS",
  "UPDATE_COLOR",
  "SWITCH_COLORS",
  "UPDATE_WORKSPACE_SETTINGS",
  "UPDATE_DOCUMENT_SETTINGS",
  "MOVE_ALL_LAYERS",
  "SET_CLIPBOARD_IS_USED",
  "SET_OVERLAY",
  "SET_MENU_IS_DISABLED",
  "SET_HISTORY_IS_DISABLED",
  "SET_HELP_TOPIC",
  "SET_IMPORT_IMAGE_FILE",
  "SET_EXPORT_OPTIONS",
  "SET_STAMP_DATA",
  "SET_APP_IS_WAITING",
  "RESET_STATE"
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

      async function executeUndo(onUndo) {
        if (onUndo.move) {
          await dispatch(moveLayer(onUndo.id, onUndo.move));
        } else {
          const ctx = prevState.layerCanvas[onUndo.id].getContext("2d")
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
        if (onRedo.move) {
          dispatch(moveLayer(onRedo.id, onRedo.move));
        } else {
          const ctx = currState.layerCanvas[onRedo.id].getContext("2d")
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
    }
    dispatch({type: REDO})
    if (nextState && nextState.historyParams && nextState.historyParams.groupWithPrevious) {
      dispatch(redo());
    }
  };
}

export const putHistoryData = (id, ctx, callback, prevImgData, params={}) => {
  const viewWidth = Math.floor(ctx.canvas.width);
  const viewHeight = Math.floor(ctx.canvas.height);
  if (!prevImgData && !!callback) {
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

export const putHistoryDataMultiple = (ids, ctxs, callbacks=[], prevImgDatas=[], params={}) => {
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
    }
  }
  
  return {
    type: PUT_HISTORY_DATA_MULTIPLE,
    payload: {array: differences, params}
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
      const ctx = getState().main.present.layerCanvas[id].getContext("2d");
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

export const updateCanvas = (id, changes, ignoreHistory=true) => {
  return {
    type: UPDATE_CANVAS,
    payload: {id, changes, ignoreHistory}
  };
};

export const updateSelectionPath = (operation, changes) => {
  return {
    type: UPDATE_SELECTION_PATH,
    payload: {changes, operation, ignoreHistory: false}
  };
};

const defaultTransformParams = {
  startEvent: null,
  rotatable: null,
  resizable: null
}

export const setTransformTarget = (target, params=defaultTransformParams) => {
  return {
    type: SET_TRANSFORM_TARGET,
    payload: {
      params: params ? params : defaultTransformParams,
      target
    }
  };
};

export const setTransformParams = (params=defaultTransformParams) => {
  return {
    type: SET_TRANSFORM_PARAMS,
    payload: {
      params: params ? params : defaultTransformParams
    }
  };
};

export const setCropIsActive = (bool, params={}) => {
  return {
    type: SET_CROP_IS_ACTIVE,
    payload: {bool, params}
  };
};

export const setCropParams = (params) => {
  return {
    type: SET_CROP_PARAMS,
    payload: params
  };
};

export const updateLayerOpacity = (id, opacity, ignoreHistory=false) => {
  return {
    type: UPDATE_LAYER_OPACITY,
    payload: {id, opacity, ignoreHistory}
  };
};

export const updateLayerBlendMode = (id, blend, ignoreHistory=false) => {
  return {
    type: UPDATE_LAYER_BLEND_MODE,
    payload: {id, blend, ignoreHistory}
  };
};

export const updateRenderOrder = (from, to, ignoreHistory=false) => {
  return {
    type: UPDATE_RENDER_ORDER,
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

export const setActiveTool = slug => {
  return {
    type: SET_ACTIVE_TOOL,
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

export const updateDocumentSettings = (changes, ignoreHistory=false) => {
  return {
    type: UPDATE_DOCUMENT_SETTINGS,
    payload: {changes, ignoreHistory}
  }
}

export const moveAllLayers = (offsetDelta, ignoreHistory=true) => {
  return {
    type: MOVE_ALL_LAYERS,
    payload: {offsetDelta, ignoreHistory}
  }
}

export const setClipboardIsUsed = bool => {
  return {
    type: SET_CLIPBOARD_IS_USED,
    payload: {bool, ignoreHistory: true}
  }
}

export const setOverlay = (overlay, params={}) => {
  return {
    type: SET_OVERLAY,
    payload: {overlay, params}
  }
}

export const setMenuIsDisabled = bool => {
  return {
    type: SET_MENU_IS_DISABLED,
    payload: bool
  }
}

export const setHistoryIsDisabled = bool => {
  return {
    type: SET_HISTORY_IS_DISABLED,
    payload: {bool, ignoreHistory: true}
  }
}

export const setHelpTopic = (topic=null) => {
  return {
    type: SET_HELP_TOPIC,
    payload: topic
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

export const setStampData = (changes, ignoreHistory=true) => {
  return {
    type: SET_STAMP_DATA,
    payload: { changes, ignoreHistory }
  }
}

export const setAppIsWaiting = bool => {
  return {
    type: SET_APP_IS_WAITING,
    payload: bool
  }
}

export const resetState = () => {
  return {
    type: RESET_STATE
  }
}