import { getDiff } from "../custom/ctxActions";
import moveLayer from "../redux/moveLayer";

import * as t from "./types";
export * from "./types";

export const createNewProject = (name, width, height) => {
  return {
    type: t.CREATE_NEW_PROJECT,
    payload: {name, width, height}
  }
}

export const setActiveProject = (id) => {
  return {
    type: t.SET_ACTIVE_PROJECT,
    payload: id
  }
}

export const updateProjectTabOrder = (from, to) => {
  return {
    type: t.UPDATE_PROJECT_TAB_ORDER,
    payload: {from, to}
  }
}

export const undo = () => {
  return async (dispatch, getState) => {
    const activeProject = getState().main.activeProject;
    if (!activeProject) {return;}
    const prevState = getState().main.projects[activeProject].past[getState().main.projects[activeProject].past.length - 1]
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
    await dispatch({type: t.UNDO})
    if (prevState && prevState.historyParams && prevState.historyParams.groupWithPrevious) {
      dispatch(undo());
    }
  };
};

export const redo = () => {
  return (dispatch, getState) => {
    const activeProject = getState().main.activeProject;
    if (!activeProject) {return;}
    const currState = getState().main.projects[activeProject].present;
    const nextState = getState().main.projects[activeProject].future[0];
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
    dispatch({type: t.REDO})
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
    type: t.PUT_HISTORY_DATA,
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
    type: t.PUT_HISTORY_DATA_MULTIPLE,
    payload: {array: differences, params}
  }
}

export const createLayer = (position, project="current", ignoreHistory=false, params={}) => {
  return {
    type: t.CREATE_LAYER,
    payload: {position, project, ignoreHistory, params}
  };
};

export const createLayerFrom = (position, source, project="current", ignoreHistory=false, params={}) => {
  return {
    type: t.CREATE_LAYER,
    payload: {position, project, source, ignoreHistory, params}
  };
};

export const deleteLayer = (id, project="current", ignoreHistory=false) => {
  return (dispatch, getState) => {
    let data = null;
    if (!ignoreHistory) {
      const ctx = getState().main.projects[project].present.layerCanvas[id].getContext("2d");
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
      type: t.DELETE_LAYER,
      payload: {id, project, data, ignoreHistory}
    });
  } 
};

export const hideLayer = (id, project="current") => {
  return {
    type: t.HIDE_LAYER,
    payload: {id, project}
  };
};

export const updateUtilityCanvas = (id, changes, ignoreHistory=true) => {
  return {
    type: t.UPDATE_UTILITY_CANVAS,
    payload: {id, changes, ignoreHistory}
  };
};

export const updateMainCanvas = changes => {
  return {
    type: t.UPDATE_MAIN_CANVAS,
    payload: changes
  };
};

export const updateSelectionPath = (operation, changes, project="current") => {
  return {
    type: t.UPDATE_SELECTION_PATH,
    payload: {operation, project, changes, ignoreHistory: false}
  };
};

export const updateClipboardSettings = (changes) => {
  return {
    type: t.UPDATE_SELECTION_PATH,
    payload: {changes}
  };
};

const defaultTransformParams = {
  startEvent: null,
  rotatable: null,
  resizable: null
}

export const setTransformTarget = (target, params=defaultTransformParams) => {
  return {
    type: t.SET_TRANSFORM_TARGET,
    payload: {
      params: params ? params : defaultTransformParams,
      target
    }
  };
};

export const setTransformParams = (params=defaultTransformParams) => {
  return {
    type: t.SET_TRANSFORM_PARAMS,
    payload: {
      params: params ? params : defaultTransformParams
    }
  };
};

export const setCropIsActive = (bool, params={}) => {
  return {
    type: t.SET_CROP_IS_ACTIVE,
    payload: {bool, params}
  };
};

export const setCropParams = (params) => {
  return {
    type: t.SET_CROP_PARAMS,
    payload: params
  };
};

export const updateLayerOpacity = (id, opacity, project="current", ignoreHistory=false) => {
  return {
    type: t.UPDATE_LAYER_OPACITY,
    payload: {id, project, opacity, ignoreHistory}
  };
};

export const updateLayerBlendMode = (id, blend, project="current", ignoreHistory=false) => {
  return {
    type: t.UPDATE_LAYER_BLEND_MODE,
    payload: {id, project, blend, ignoreHistory}
  };
};

export const updateRenderOrder = (from, to, project="current", ignoreHistory=false) => {
  return {
    type: t.UPDATE_RENDER_ORDER,
    payload: {from, to, project, ignoreHistory}
  };
};

export const updateLayerPosition = (id, size, offset, project="current", ignoreHistory=true) => {
  return {
    type: t.UPDATE_LAYER_POSITION,
    payload: {id, project, size, offset, ignoreHistory}
  };
};

export const updateStagingPosition = id => {
  return {
    type: t.UPDATE_STAGING_POSITION,
    payload: {id, ignoreHistory: true}
  };
};

export const setEnableLayerRename = (id, project="current", renamable=true) => {
  return {
    type: t.SET_ENABLE_LAYER_RENAME,
    payload: {id, project, renamable, ignoreHistory: true}
  };
};

export const updateLayerName = (id, project="current", name) => {
  return {
    type: t.UPDATE_LAYER_NAME,
    payload: {id, project, name}
  };
};

export const makeActiveLayer = (layerId, project="current") => {
  return {
    type: t.MAKE_ACTIVE_LAYER,
    payload: {layerId, project, ignoreHistory: true}
  };
};

export const setActiveTool = slug => {
  return {
    type: t.SET_ACTIVE_TOOL,
    payload: slug
  };
};

export const updateToolSettings = (tool, changes) => {
  return {
    type: t.UPDATE_TOOL_SETTINGS,
    payload: {tool, changes}
  };
};

export const updateColor = (key, value) => {
  return {
    type: t.UPDATE_COLOR,
    payload: {key, value}
  };
};

export const switchColors = () => {
  return {
    type: t.SWITCH_COLORS
  };
};

export const updateWorkspaceSettings = (changes) => {
  return {
    type: t.UPDATE_WORKSPACE_SETTINGS,
    payload: changes
  }
}

export const updateDocumentSettings = (changes, project="current", ignoreHistory=false) => {
  return {
    type: t.UPDATE_DOCUMENT_SETTINGS,
    payload: {changes, project, ignoreHistory}
  }
}

// export const moveAllLayers = (offsetDelta, project="current", ignoreHistory=true) => {
//   return {
//     type: t.MOVE_ALL_LAYERS,
//     payload: {offsetDelta, project, ignoreHistory}
//   }
// }

export const setClipboardIsUsed = bool => {
  return {
    type: t.SET_CLIPBOARD_IS_USED,
    payload: {bool, ignoreHistory: true}
  }
}

export const setOverlay = (overlay, params={}) => {
  return {
    type: t.SET_OVERLAY,
    payload: {overlay, params}
  }
}

export const setMenuIsDisabled = bool => {
  return {
    type: t.SET_MENU_IS_DISABLED,
    payload: bool
  }
}

export const setHistoryIsDisabled = (bool, project="current") => {
  return {
    type: t.SET_HISTORY_IS_DISABLED,
    payload: {bool, project, ignoreHistory: true}
  }
}

export const setHelpTopic = (topic=null) => {
  return {
    type: t.SET_HELP_TOPIC,
    payload: topic
  }
}

export const setImportImageFile = (file) => {
  return {
    type: t.SET_IMPORT_IMAGE_FILE,
    payload: file
  }
}

export const setExportOptions = (type=null, compression=null) => {
  return {
    type: t.SET_EXPORT_OPTIONS,
    payload: { type, compression }
  }
}

export const setStampData = (changes, ignoreHistory=true) => {
  return {
    type: t.SET_STAMP_DATA,
    payload: { changes, ignoreHistory }
  }
}

export const setAppIsWaiting = bool => {
  return {
    type: t.SET_APP_IS_WAITING,
    payload: bool
  }
}

export const resetState = () => {
  return {
    type: t.RESET_STATE
  }
}