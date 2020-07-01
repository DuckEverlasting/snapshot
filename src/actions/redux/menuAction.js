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
  putHistoryDataMultiple,
  setImportImageFile,
  setTransformSelection,
  setTransformParams,
  updateLayerPosition,
  updateDocumentSettings,
} from "./index";

import { MoveAction } from "../../utils/ToolAction";

import { filter } from "../../utils/filters";

import { saveAs } from 'file-saver';

import manipulate from "../../reducers/custom/manipulateReducer";

import render from "./renderCanvas";

export function exportDocument(type, compression=null) {
  return (dispatch, getState) => {
    const mainCanvas = getState().main.present.layerCanvas.main,
      fileName = getState().main.present.documentSettings.documentName;

    const href = mainCanvas.toDataURL(type, compression);
  
    saveAs(href, fileName);

    window.URL.revokeObjectURL(href);
  }
}

export function resizeDocument(width, height, rescale=false, anchor=null) {
  if (!width || !height) {
    throw new Error("Resize must specify both height and width.");
  }
  if (!rescale && !anchor) {
    throw new Error("Resize must specify either parameter 'rescale' or parameter 'anchor'");
  }

  return async (dispatch, getState) => {
    const { documentWidth, documentHeight } = getState().main.present.documentSettings;
    const layerSettings = getState().main.present.layerSettings;
    const layerCanvas = getState().main.present.layerCanvas;

    const offsetDelta = {
      "top-left": {x: 0, y: 0},
      "top-center": {x: -(documentWidth - width) / 2, y: 0},
      "top-right": {x: -(documentWidth - width), y: 0},
      "center-left": {x: 0, y: -(documentHeight - height) / 2},
      "center-center": {x: -(documentWidth - width) / 2, y: -(documentHeight - height) / 2},
      "center-right": {x: -(documentWidth - width), y: -(documentHeight - height) / 2},
      "bottom-left": {x: 0, y: -(documentHeight - height)},
      "bottom-center": {x: -(documentWidth - width) / 2, y: -(documentHeight - height)},
      "bottom-right": {x: -(documentWidth - width), y: -(documentHeight - height)}
    }

    await dispatch(updateDocumentSettings({documentWidth: width, documentHeight: height}));
    
    await dispatch(menuAction("deselect"));
    layerCanvas.selection.width = width;
    layerCanvas.selection.height = height;
    layerCanvas.staging.width = width;
    layerCanvas.staging.height = height;
    layerCanvas.placeholder.width = width;
    layerCanvas.placeholder.height = height;
    const temp = new OffscreenCanvas(documentWidth, documentHeight);
    temp.getContext("2d").drawImage(layerCanvas.clipboard, 0, 0);
    layerCanvas.clipboard.width = width;
    layerCanvas.clipboard.height = height;
    layerCanvas.clipboard.getContext("2d").drawImage(temp, 0, 0);

    if (anchor) {
      await getState().main.present.layerOrder.forEach(targetLayer => {
        const translateData = {
          offX: layerSettings[targetLayer].offset.x,
          offY: layerSettings[targetLayer].offset.y,
          documentWidth: width,
          documentHeight: height,
        }
        const action = new MoveAction(targetLayer, layerCanvas, dispatch, translateData);
        action.manualStart();
        action.manualEnd(offsetDelta[anchor], true);
      })
    } else {
      await getState().main.present.layerOrder.forEach(targetLayer => {
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
      return (dispatch, getState) => {
        const ctx = getState().main.present.layerCanvas.selection.getContext("2d");
        dispatch(
          putHistoryData("selection", ctx, () =>
            manipulate(ctx, {
              action: "clear",
              params: { selectionPath: null }
            })
          )
        );
        dispatch(updateSelectionPath(null));
        dispatch(render());
      };
    case "duplicate":
      return (dispatch, getState) => {
        const { activeLayer } = getState().main.present;
        const source = getState().main.present.layerCanvas[activeLayer];
        dispatch(createLayerFrom(activeLayer, source));
        dispatch(render());
      };
    case "copy":
      // PROBABLY SHOULD MOVE CLIPBOARD TO ITS OWN REDUCER???
      return (dispatch, getState) => {
        const { activeLayer, selectionPath } = getState().main.present;
        const ctx = getState().main.present.layerCanvas.clipboard.getContext("2d");
        const sourceCtx = getState().main.present.layerCanvas[
          activeLayer
        ].getContext("2d");
        const offset = getState().main.present.layerSettings[activeLayer].offset;
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
        dispatch(updateLayerPosition("clipboard", null, offset, true));
      };
    case "paste":
      return (dispatch, getState) => {
        const { activeLayer } = getState().main.present;
        if (!activeLayer) return;
        const ctx = getState().main.present.layerCanvas[activeLayer].getContext("2d");
        const sourceCtx = getState().main.present.layerCanvas.clipboard.getContext("2d");
        const offset = getState().main.present.layerSettings.clipboard.offset;
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
      return dispatch => {
        dispatch(undo());
        return dispatch(render());
      }
    case "redo":
      return dispatch => {
        dispatch(redo());
        return dispatch(render());
      }
    case "newLayer":
      return (dispatch, getState) => {
        const { activeLayer, layerOrder } = getState().main.present;
        if (activeLayer) {
          dispatch(createLayer(activeLayer));
        } else {
          dispatch(createLayer(layerOrder.length));
        }
      };
    case "deleteLayer":
      return (dispatch, getState) => {
        const { activeLayer } = getState().main.present;
        if (activeLayer) {
          dispatch(deleteLayer(activeLayer));
          dispatch(render());
        }
      };
    case "hideLayer":
      return (dispatch, getState) => {
        const { activeLayer } = getState().main.present;
        if (activeLayer) {
          dispatch(hideLayer(activeLayer));
          dispatch(render());
        }
      };
    case "clear":
      return async (dispatch, getState) => {
        const { activeLayer, selectionPath, selectionActive } = getState().main.present;
        if (!selectionActive || !activeLayer || !selectionPath) return; 
        const ctx = getState().main.present.layerCanvas[activeLayer].getContext("2d");
        const offset = getState().main.present.layerSettings[activeLayer].offset;
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
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.addEventListener("change", addFile, false)
        fileInput.click();
        
        async function addFile() {
          const name = fileInput.files[0].name.replace(/\.[^/.]+$/, "");
          dispatch(setTransformParams({resizable: true, rotatable: true}))
          dispatch(createLayer(getState().main.present.layerOrder.length, false, {name}));
          dispatch(setImportImageFile(fileInput.files[0]));
          fileInput.removeEventListener("change", addFile, false);
        }
      }
    case "export":
      return (dispatch, getState) => {
        const mainCanvas = getState().main.present.layerCanvas.main,
          { type, compression } = getState().ui.exportOptions,
          fileName = getState().main.present.documentSettings.documentName;

        if (!type) return;

        const href = mainCanvas.toDataURL(type, compression);
      
        saveAs(href, fileName);

        window.URL.revokeObjectURL(href);
      }
    case "transform":
      return async (dispatch, getState) => {
        const { activeLayer, layerCanvas, layerSettings, selectionPath } = getState().main.present;
        if (!activeLayer) return
        const activeCtx = layerCanvas[activeLayer].getContext("2d"),
          selectionCtx = layerCanvas.selection.getContext("2d"),
          placeholderCtx = layerCanvas.placeholder.getContext("2d");
        manipulate(placeholderCtx, {
          action: "paste",
          params: {
            sourceCtx: activeCtx,
            dest: {x: 0, y: 0},
            clip: selectionPath,
            clearFirst: true
          }
        })
        await dispatch(putHistoryDataMultiple([activeLayer, "selection"], [activeCtx, selectionCtx], [
          () => {
          manipulate(activeCtx, {
            action: "clear",
            params: {
              clip: selectionPath,
              clipOffset: layerSettings[activeLayer].offset
            }
          })
        }, () => {
          manipulate(selectionCtx, {
            action: "clear",
            params: { selectionPath: null }
          })
        }]));
        dispatch(setTransformSelection(
          activeLayer,
          {startEvent: null, resizable: true, rotatable: true},
          true
        ));
        dispatch(render());
        dispatch(updateSelectionPath(null, true));
        return;
      }
    case "desaturate":
      return async (dispatch, getState) => {
        const { activeLayer, layerCanvas } = getState().main.present;
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
