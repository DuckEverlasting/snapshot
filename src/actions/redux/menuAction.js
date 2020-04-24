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
  putHistoryData
} from "./index";

import manipulate from "../../reducers/custom/manipulateReducer";

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
        manipulate(ctx, {
          action: "paste",
          params: {
            sourceCtx,
            dest: [0, 0],
            clip: selectionPath,
            clearFirst: true
          }
        });
        dispatch(setClipboardIsUsed(true));
      };
    case "paste":
      return (dispatch, getState) => {
        const { activeLayer } = getState().main.present;
        const ctx = getState().main.present.layerData[activeLayer].getContext("2d");
        const sourceCtx = getState().main.present.layerData.clipboard.getContext("2d");
        putHistoryData(activeLayer, ctx, () =>
          manipulate(ctx, {
            action: "paste",
            params: {
              sourceCtx,
              dest: [0, 0]
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
    //         dest: [0, 0],
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
        if (!selectionPath) {
          return;
        } else {
          dispatch(
            putHistoryData(activeLayer, ctx, () =>
              manipulate(ctx, {
                action: "clear",
                params: {
                  clip: selectionPath
                }
              })
            )
          );
        }
      };
    case "import":
      return async (dispatch, getState) => {
        const length = getState().main.present.layerOrder.length
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.addEventListener("change", addFile, false)
        fileInput.click();
        
        async function addFile() {
          await dispatch(createLayer(length, true));
          const image = new Image();
          image.src = URL.createObjectURL(fileInput.files[0]);
          image.onload = () => {
            const ctx = getState().main.present.layerData[length + 1].getContext("2d");
            ctx.drawImage(image, 0, 0);
          }
          fileInput.removeEventListener("change", addFile, false)
        }
      }
    default:
      break;
  }
}
