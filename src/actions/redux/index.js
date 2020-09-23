import { getDiff } from "../custom/ctxActions";
import { getCanvas } from "../../utils/helpers";
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

const reconcileSizing = (fromState, toState, utilityCanvas) => {
  if (!toState) {return;}
  if (
    toState.documentSettings.width !== fromState.documentSettings.width ||
    toState.documentSettings.height !== fromState.documentSettings.height
  ) {
    const { width, height } = toState.documentSettings;
    utilityCanvas.staging.width = width;
    utilityCanvas.staging.height = height;
    utilityCanvas.placeholder.width = width;
    utilityCanvas.placeholder.height = height;
    const temp = getCanvas(fromState.documentSettings.width, fromState.documentSettings.height);
    temp.getContext("2d").drawImage(utilityCanvas.clipboard, 0, 0);
    utilityCanvas.clipboard.width = width;
    utilityCanvas.clipboard.height = height;
    utilityCanvas.clipboard.getContext("2d").drawImage(temp, 0, 0);
  }
}

export const undo = () => {
  return async (dispatch, getState) => {
    const activeProject = getState().main.activeProject;
    if (!activeProject) {return;}
    const currState = getState().main.projects[activeProject].present,
      prevState = getState().main.projects[activeProject].past[getState().main.projects[activeProject].past.length - 1],
      utilityCanvas = getState().main.utilityCanvas;
    reconcileSizing(currState, prevState, utilityCanvas);
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
          const ctx = prevState.layerCanvas[onUndo.id].getContext("2d"),
            changeData = onUndo.data,
            viewWidth = Math.floor(ctx.canvas.width),
            viewHeight = Math.floor(ctx.canvas.height),
            imgData = ctx.getImageData(
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
    await dispatch({type: t.UNDO, payload: {project: "current"}});
    if (prevState && prevState.historyParams && prevState.historyParams.groupWithPrevious) {
      dispatch(undo());
    }
  };
};

export const redo = () => {
  return (dispatch, getState) => {
    const activeProject = getState().main.activeProject;
    if (!activeProject) {return;}
    const currState = getState().main.projects[activeProject].present,
      nextState = getState().main.projects[activeProject].future[0],
      utilityCanvas = getState().main.utilityCanvas;
    reconcileSizing(currState, nextState, utilityCanvas);
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
          const ctx = currState.layerCanvas[onRedo.id].getContext("2d"),
            changeData = onRedo.data,
            viewWidth = Math.floor(ctx.canvas.width),
            viewHeight = Math.floor(ctx.canvas.height),
            imgData = ctx.getImageData(
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
    dispatch({type: t.REDO, payload: {project: "current"}});
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
    payload: {id, project: "current", ...getDiff(ctx, {prevImgData}), params}
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

export const createLayer = (position, params={}) => {
  return {
    type: t.CREATE_LAYER,
    payload: {position, project: params.project || "current", params}
  };
};

export const createLayerFrom = (position, source, params={}) => {
  return {
    type: t.CREATE_LAYER,
    payload: {position, project: params.project || "current", source, params}
  };
};

export const deleteLayer = (id, params={}) => {
  return (dispatch, getState) => {
    let data = null,
      project = params.project;
    if (!params.ignoreHistory) {
      if (!project) {
        project = getState().main.activeProject;
      }
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
      payload: {id, project, data, params}
    });
  } 
};

export const hideLayer = (id, params={}) => {
  return {
    type: t.HIDE_LAYER,
    payload: {id, project: params.project || "current"}
  };
};

export const updateUtilityCanvas = (id, changes) => {
  return {
    type: t.UPDATE_UTILITY_CANVAS,
    payload: {id, changes}
  };
};

export const updateMainCanvas = changes => {
  return {
    type: t.UPDATE_MAIN_CANVAS,
    payload: changes
  };
};

export const updateSelectionPath = (operation, changes, params={}) => {
  return {
    type: t.UPDATE_SELECTION_PATH,
    payload: {operation, project: params.project || "current", changes}
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

export const updateLayerOpacity = (id, opacity, params={}) => {
  return {
    type: t.UPDATE_LAYER_OPACITY,
    payload: {id, project: params.project || "current", opacity, params}
  };
};

export const updateLayerBlendMode = (id, blend, params={}) => {
  return {
    type: t.UPDATE_LAYER_BLEND_MODE,
    payload: {id, project: params.project || "current", blend, params}
  };
};

export const updateRenderOrder = (from, to, params={}) => {
  return {
    type: t.UPDATE_RENDER_ORDER,
    payload: {from, to, project: params.project || "current", params}
  };
};

export const updateLayerPosition = (id, size, offset, params={}) => {
  return {
    type: t.UPDATE_LAYER_POSITION,
    payload: {id, project: params.project || "current", size, offset, params: {ignoreHistory: true, ...params}}
  };
};

export const updateStagingPosition = id => {
  return {
    type: t.UPDATE_STAGING_POSITION,
    payload: {id, params: {ignoreHistory: true}}
  };
};

export const setEnableLayerRename = (id, renamable=true, params={}) => {
  return {
    type: t.SET_ENABLE_LAYER_RENAME,
    payload: {id, project: params.project || "current", renamable, params}
  };
};

export const updateLayerName = (id, name, params={}) => {
  return {
    type: t.UPDATE_LAYER_NAME,
    payload: {id, project: params.project || "current", name, params}
  };
};

export const makeActiveLayer = (layerId, params={}) => {
  return {
    type: t.MAKE_ACTIVE_LAYER,
    payload: {layerId, project: params.project || "current", params: {ignoreHistory: true, ...params}}
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

export const updateDocumentSettings = (changes, params={}) => {
  return {
    type: t.UPDATE_DOCUMENT_SETTINGS,
    payload: {changes, project: params.project || "current", params}
  }
}

// export const moveAllLayers = (offsetDelta, params={}) => {
//   return {
//     type: t.MOVE_ALL_LAYERS,
//     payload: {offsetDelta, project: params.project || "current", params: {ignoreHistory: true, ...params}}
//   }
// }

export const setClipboardIsUsed = bool => {
  return {
    type: t.SET_CLIPBOARD_IS_USED,
    payload: {bool, params: {ignoreHistory: true}}
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

export const setHistoryIsDisabled = (bool, params={}) => {
  return {
    type: t.SET_HISTORY_IS_DISABLED,
    payload: {bool, project: params.project || "current", params: {ignoreHistory: true, ...params}}
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

export const setStampData = (changes, params={}) => {
  return {
    type: t.SET_STAMP_DATA,
    payload: { changes, params }
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