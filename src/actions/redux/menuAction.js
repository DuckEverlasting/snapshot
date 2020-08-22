import {
  switchColors,
  updateSelectionPath,
  createLayer,
  createLayerFrom,
  deleteLayer,
  hideLayer,
  undo,
  redo,
  setClipboardIsUsed,
  putHistoryData,
  setImportImageFile,
  setTransformTarget,
  setTransformParams,
  updateLayerPosition,
  updateDocumentSettings,
  updateClipboardSettings
} from "./index";

import { MoveAction } from "../../utils/ToolAction";

import { filter } from "../../utils/filters";

import { saveAs } from 'file-saver';

import manipulate from "../../reducers/custom/manipulateReducer";

import render from "./renderCanvas";
import { getCanvas } from "../../utils/helpers";

export function exportDocument(type, compression=null) {
  return (dispatch, getState) => {
    const activeProject = getState().main.activeProject;
    if (!activeProject) {return;}
    const mainCanvas = getState().main.projects[activeProject].present.mainCanvas,
      fileName = getState().main.projects[activeProject].present.documentSettings.documentName;

    const href = mainCanvas.toDataURL(type, compression);
  
    saveAs(href, fileName);

    window.URL.revokeObjectURL(href);
  }
}

export function resizeDocument(width, height, offset=null, rescale=false) {
  if (!width || !height) {
    throw new Error("Resize must specify both height and width.");
  }
  if (!rescale && !offset) {
    throw new Error("Resize must specify either parameter 'rescale' or parameter 'offset'");
  }
  if (offset && (
    !typeof offset === "string" ||
    !offset.x ||
    typeof offset.x !== "number" ||
    !offset.y ||
    typeof offset.y !== "number"
  )) {
    throw new TypeError("Invalid type in function resizeDocument: 'offset' must be a string or an object containing numbers 'x' and 'y'");
  }

  return async (dispatch, getState) => {
    const activeProject = getState().main.activeProject;
    if (!activeProject) {return;}
    const { documentWidth, documentHeight } = getState().main.projects[activeProject].present.documentSettings;
    const layerSettings = getState().main.projects[activeProject].present.layerSettings;
    const layerCanvas = getState().main.projects[activeProject].present.layerCanvas;
    const utilityCanvas = getState().main.utilityCanvas;

    const offsetConversion = {
      "top-left": {x: 0, y: 0},
      "top-center": {x: (documentWidth - width) / 2, y: 0},
      "top-right": {x: documentWidth - width, y: 0},
      "center-left": {x: 0, y: documentHeight - height / 2},
      "center-center": {x: (documentWidth - width) / 2, y: (documentHeight - height) / 2},
      "center-right": {x: documentWidth - width, y: (documentHeight - height) / 2},
      "bottom-left": {x: 0, y: documentHeight - height},
      "bottom-center": {x: (documentWidth - width) / 2, y: documentHeight - height},
      "bottom-right": {x: documentWidth - width, y: documentHeight - height}
    }

    await dispatch(updateDocumentSettings({documentWidth: width, documentHeight: height}));

    await dispatch(menuAction("deselect"));
    utilityCanvas.staging.width = width;
    utilityCanvas.staging.height = height;
    utilityCanvas.placeholder.width = width;
    utilityCanvas.placeholder.height = height;
    const temp = getCanvas(documentWidth, documentHeight);
    temp.getContext("2d").drawImage(utilityCanvas.clipboard, 0, 0);
    utilityCanvas.clipboard.width = width;
    utilityCanvas.clipboard.height = height;
    utilityCanvas.clipboard.getContext("2d").drawImage(temp, 0, 0);

    if (offset) {
      const parsedOffset = typeof offset === "string" ? offsetConversion[offset] : offset;
      await getState().main.projects[activeProject].present.renderOrder.forEach(targetLayer => {
        const translateData = {
          offX: layerSettings[targetLayer].offset.x,
          offY: layerSettings[targetLayer].offset.y,
          documentWidth: width,
          documentHeight: height,
        }
        const action = new MoveAction(targetLayer, layerCanvas, dispatch, translateData);
        action.manualStart();
        action.manualEnd({x: -parsedOffset.x, y: -parsedOffset.y}, true);
      })
    } else {
      await getState().main.projects[activeProject].present.renderOrder.forEach(targetLayer => {
        const widthFactor = width / documentWidth;
        const heightFactor = height / documentHeight;
        temp.width = layerCanvas[targetLayer].width * widthFactor;
        temp.height = layerCanvas[targetLayer].height * heightFactor;
        manipulate(temp.getContext("2d"), {
          action: "paste",
          params: {
            sourceCtx: layerCanvas[targetLayer].getContext("2d"),
            dest: {x: 0, y: 0},
            size: {w: temp.width, h: temp.height},
            clearFirst: true
          }
        });
        layerCanvas[targetLayer].width = temp.width;
        layerCanvas[targetLayer].height = temp.height;
        manipulate(layerCanvas[targetLayer].getContext("2d"), {
          action: "paste",
          params: {
            sourceCtx: temp.getContext("2d"),
            dest: {x: 0, y: 0},
            clearFirst: true
          }
        });
        const newOffset = {
          x: layerSettings[targetLayer].offset.x * widthFactor,
          y: layerSettings[targetLayer].offset.y * heightFactor
        }
        dispatch(updateLayerPosition(targetLayer, null, newOffset));
      });
    }

    dispatch(render());
  }
}

export default function menuAction(action) {
  switch (action) {
    case "switchColors":
      return switchColors();
    case "deselect":
      return (dispatch) => {
        dispatch(updateSelectionPath("clear"));
        dispatch(render());
      };
    case "reselect":
      return (dispatch, getState) => {
        const activeProject = getState().main.activeProject;
        if (!activeProject) {return;}
        const prevSelection = getState().main.projects[activeProject].present.previousSelection;
        if (prevSelection) {
          dispatch(updateSelectionPath("new", prevSelection));
          dispatch(render());
        }
      }
    case "duplicate":
      return (dispatch, getState) => {
        const activeProject = getState().main.activeProject;
        if (!activeProject) {return;}
        const { activeLayer } = getState().main.projects[activeProject].present;
        const source = getState().main.projects[activeProject].present.layerCanvas[activeLayer];
        dispatch(createLayerFrom(activeLayer, source));
        dispatch(render());
      };
    case "copy":
      return (dispatch, getState) => {
        const activeProject = getState().main.activeProject;
        if (!activeProject) {return;}
        const { activeLayer, selectionPath } = getState().main.projects[activeProject].present;
        const ctx = getState().main.utilityCanvas.clipboard.getContext("2d");
        const sourceCtx = getState().main.projects[activeProject].present.layerCanvas[
          activeLayer
        ].getContext("2d");
        const offset = getState().main.projects[activeProject].present.layerSettings[activeLayer].offset;
        manipulate(ctx, {
          action: "paste",
          params: {
            sourceCtx,
            dest: {x: 0, y: 0},
            clip: selectionPath,
            clipOffset: offset,
            clearFirst: true
          }
        });
        dispatch(setClipboardIsUsed(true));
        dispatch(updateClipboardSettings("clipboard", offset));
      };
    case "paste":
      return (dispatch, getState) => {
        const activeProject = getState().main.activeProject;
        if (!activeProject) {return;}
        const { activeLayer } = getState().main.projects[activeProject].present;
        if (!activeLayer) return;
        const ctx = getState().main.projects[activeProject].present.layerCanvas[activeLayer].getContext("2d");
        const sourceCtx = getState().main.utilityCanvas.clipboard.getContext("2d");
        const offset = getState().main.clipboardSettings.offset;
        putHistoryData(activeLayer, ctx, () =>
          manipulate(ctx, {
            action: "paste",
            params: {
              sourceCtx,
              dest: offset
            }
          })
        );
        dispatch(render());
      };
    case "undo":
      return async dispatch => {
        await dispatch(undo());
        return dispatch(render());
      }
    case "redo":
      return async dispatch => {
        await dispatch(redo());
        return dispatch(render());
      }
    case "newLayer":
      return (dispatch, getState) => {
        const activeProject = getState().main.activeProject;
        if (!activeProject) {return;}
        const { activeLayer, renderOrder } = getState().main.projects[activeProject].present;
        if (activeLayer) {
          dispatch(createLayer(activeLayer));
        } else {
          dispatch(createLayer(renderOrder.length));
        }
      };
    case "deleteLayer":
      return (dispatch, getState) => {
        const activeProject = getState().main.activeProject;
        if (!activeProject) {return;}
        const { activeLayer } = getState().main.projects[activeProject].present;
        if (activeLayer) {
          dispatch(deleteLayer(activeLayer));
          dispatch(render());
        }
      };
    case "hideLayer":
      return (dispatch, getState) => {
        const activeProject = getState().main.activeProject;
        if (!activeProject) {return;}
        const { activeLayer } = getState().main.projects[activeProject].present;
        if (activeLayer) {
          dispatch(hideLayer(activeLayer));
          dispatch(render());
        }
      };
    case "clear":
      return async (dispatch, getState) => {
        const activeProject = getState().main.activeProject;
        if (!activeProject) {return;}
        const { activeLayer, selectionPath, selectionActive } = getState().main.projects[activeProject].present;
        if (!selectionActive || !activeLayer || !selectionPath) return; 
        const ctx = getState().main.projects[activeProject].present.layerCanvas[activeLayer].getContext("2d");
        const offset = getState().main.projects[activeProject].present.layerSettings[activeLayer].offset;
        await dispatch(
          putHistoryData(activeLayer, ctx, () =>
            manipulate(ctx, {
              action: "clear",
              params: {
                clip: selectionPath,
                clipOffset: offset
              }
            })
          )
        );
        dispatch(render());
      };
    case "import":
      return async (dispatch, getState) => {
        const activeProject = getState().main.activeProject;
        if (!activeProject) {return;}
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.addEventListener("change", addFile, false)
        fileInput.click();
        
        async function addFile() {
          const name = fileInput.files[0].name.replace(/\.[^/.]+$/, "");
          dispatch(setTransformParams({resizable: true, rotatable: true}))
          dispatch(createLayer(getState().main.projects[activeProject].present.renderOrder.length, "current", false, {name}));
          dispatch(setImportImageFile(fileInput.files[0]));
          fileInput.removeEventListener("change", addFile, false);
        }
      }
    case "export":
      return (dispatch, getState) => {
        const activeProject = getState().main.activeProject;
        if (!activeProject) {return;}
        const mainCanvas = getState().main.projects[activeProject].present.mainCanvas,
          { type, compression } = getState().ui.exportOptions,
          fileName = getState().main.projects[activeProject].present.documentSettings.documentName;

        if (!type) return;

        const href = mainCanvas.toDataURL(type, compression);
      
        saveAs(href, fileName);

        window.URL.revokeObjectURL(href);
      }
    case "transform":
      return async (dispatch, getState) => {
        const activeProject = getState().main.activeProject;
        if (!activeProject) {return;}
        const { activeLayer, layerCanvas, layerSettings, selectionPath } = getState().main.projects[activeProject].present;
        const utilityCanvas = getState().main.utilityCanvas;
        if (!activeLayer) return
        const activeCtx = layerCanvas[activeLayer].getContext("2d"),
          placeholderCtx = utilityCanvas.placeholder.getContext("2d");
        manipulate(placeholderCtx, {
          action: "paste",
          params: {
            sourceCtx: activeCtx,
            dest: {x: 0, y: 0},
            clip: selectionPath,
            clearFirst: true
          }
        })
        await dispatch(putHistoryData(activeLayer, activeCtx, () => {
          manipulate(activeCtx, {
            action: "clear",
            params: {
              clip: selectionPath,
              clipOffset: layerSettings[activeLayer].offset
            }
          })
        }));
        dispatch(setTransformTarget(
          activeLayer,
          {startEvent: null, resizable: true, rotatable: true}
        ));
        dispatch(updateSelectionPath("clear"));
        dispatch(render());
        return;
      }
    case "desaturate":
      return async (dispatch, getState) => {
        const activeProject = getState().main.activeProject;
        if (!activeProject) {return;}
        const { activeLayer, layerCanvas } = getState().main.projects[activeProject].present;
        if (!activeLayer) return
        const ctx = layerCanvas[activeLayer].getContext("2d");
        const activeData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        await dispatch(
          putHistoryData(activeLayer, ctx, () =>
            filter.saturation.apply(activeData.data, {amount: -100})
          )
        );
        dispatch(render());
      }
    default:
      break;
  }
}
