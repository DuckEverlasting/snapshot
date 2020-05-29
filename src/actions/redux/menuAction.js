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
  updateLayerPosition
} from "./index";

import { saveAs } from 'file-saver';

import manipulate from "../../reducers/custom/manipulateReducer";

export function exportDocument(type, compression=null) {
  return (dispatch, getState) => {
    const { layerData, layerSettings, layerOrder } = getState().main.present,
      placeholderCtx = layerData.placeholder.getContext("2d"),
      fileName = getState().main.present.documentSettings.documentName
  
    layerOrder.forEach(id => {
      if (!layerSettings[id].hidden) {
        const sourceCtx = layerData[id].getContext("2d"); 
        manipulate(placeholderCtx, {
          action: "paste",
          params: {
            sourceCtx,
            dest: {x: 0, y: 0}
          }
        })
      }
    })

    const href = placeholderCtx.canvas.toDataURL(type, compression);
  
    saveAs(href, fileName);

    window.URL.revokeObjectURL(href);
  }
}

export default function menuAction(action) {
  switch (action) {
    case "switchColors":
      return switchColors();
    case "deselect":
      return (dispatch, getState) => {
        const ctx = getState().main.present.layerData.selection.getContext("2d");
        dispatch(
          putHistoryData("selection", ctx, () =>
            manipulate(ctx, {
              action: "clear",
              params: { selectionPath: null }
            })
          )
        );
        dispatch(updateSelectionPath(null));
      };
    case "duplicate":
      return (dispatch, getState) => {
        const { activeLayer } = getState().main.present;
        const source = getState().main.present.layerData[activeLayer];
        dispatch(createLayerFrom(activeLayer, source));
      };
    case "copy":
      // PROBABLY SHOULD MOVE CLIPBOARD TO ITS OWN REDUCER???
      return (dispatch, getState) => {
        const { activeLayer, selectionPath } = getState().main.present;
        const ctx = getState().main.present.layerData.clipboard.getContext("2d");
        const sourceCtx = getState().main.present.layerData[
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
        const ctx = getState().main.present.layerData[activeLayer].getContext("2d");
        const sourceCtx = getState().main.present.layerData.clipboard.getContext("2d");
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
      };
    // case "pasteToNew":
    //   return (dispatch, getState) => {
    //     const {
    //       layerCounter: newLayerId,
    //       activeLayer
    //     } = getState().main.present;
    //     const sourceCtx = getState().main.present.layerData.clipboard.getContext("2d");
    //     dispatch(createLayer(activeLayer));
    //     const ctx = getState().main.present.layerData[newLayerId].getContext("2d");
    //     manipulate(ctx, {
    //       action: "paste",
    //       params: {
    //         sourceCtx,
    //         dest: {x: 0, y: 0},
    //         clearFirst: true
    //       }
    //     });
    //   };
    case "undo":
      return undo();
    case "redo":
      return redo();
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
        }
      };
    case "hideLayer":
      return (dispatch, getState) => {
        const { activeLayer } = getState().main.present;
        if (activeLayer) {
          dispatch(hideLayer(activeLayer));
        }
      };
    case "clear":
      return (dispatch, getState) => {
        const { activeLayer, selectionPath } = getState().main.present;
        const ctx = getState().main.present.layerData[activeLayer].getContext("2d");
        const offset = getState().main.present.layerSettings[activeLayer].offset;
        if (!selectionPath) {
          return;
        } else {
          dispatch(
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
        }
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
          dispatch(createLayer(getState().main.present.layerOrder.length, false, {name}));
          dispatch(setImportImageFile(fileInput.files[0]));
          fileInput.removeEventListener("change", addFile, false);
        }
      }
    case "export":
      return (dispatch, getState) => {
        const { layerData, layerSettings, layerOrder } = getState().main.present,
          placeholderCtx = layerData.placeholder.getContext("2d"),
          { type, compression } = getState().ui.exportOptions,
          fileName = getState().main.present.documentSettings.documentName;

        if (!type) return;
      
        layerOrder.forEach(id => {
          if (!layerSettings[id].hidden) {
            const sourceCtx = layerData[id].getContext("2d"); 
            manipulate(placeholderCtx, {
              action: "paste",
              params: {
                sourceCtx,
                dest: {x: 0, y: 0}
              }
            })
          }
        })

        const href = placeholderCtx.canvas.toDataURL(type, compression);
      
        saveAs(href, fileName);

        window.URL.revokeObjectURL(href);
      }
    case "transform":
      return (dispatch, getState) => {
        const { activeLayer, layerData, layerSettings, selectionPath } = getState().main.present;
        if (!activeLayer) return
        const activeCtx = layerData[activeLayer].getContext("2d"),
          selectionCtx = layerData.selection.getContext("2d"),
          placeholderCtx = layerData.placeholder.getContext("2d");
        manipulate(placeholderCtx, {
          action: "paste",
          params: {
            sourceCtx: activeCtx,
            dest: {x: 0, y: 0},
            clip: selectionPath,
            clearFirst: true
          }
        })
        dispatch(putHistoryDataMultiple([activeLayer, "selection"], [activeCtx, selectionCtx], [
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
        dispatch(updateSelectionPath(null, true));
        return dispatch(setTransformSelection(
          activeLayer,
          {startEvent: null, resizable: true, rotatable: true},
          true
        ));
      }
    default:
      break;
  }
}
