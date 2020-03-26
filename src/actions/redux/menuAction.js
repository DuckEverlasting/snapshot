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

import filter, { contrast, saturation } from "../../utils/filters";

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
    case "brightness":
      const value = prompt("Enter value")
      return (dispatch, getState) => {
        const { activeLayer, selectionPath } = getState().main.present;
        const ctx = getState().main.present.layerData[activeLayer].getContext("2d");
        const stagingCtx = getState().main.present.layerData.staging.getContext("2d");
        if (!selectionPath) {
          return;
        } else {
          dispatch(
            putHistoryData(activeLayer, ctx, () =>
              filter(ctx, {
                filter: saturation,
                value,
                clip: selectionPath,
                staging: stagingCtx
              })
            )
          );
        }
      };
    case "saturate":
      const value = prompt("Enter value")
      return (dispatch, getState) => {
        const { activeLayer, selectionPath } = getState().main.present;
        const ctx = getState().main.present.layerData[activeLayer].getContext("2d");
        const stagingCtx = getState().main.present.layerData.staging.getContext("2d");
        if (!selectionPath) {
          return;
        } else {
          dispatch(
            putHistoryData(activeLayer, ctx, () =>
              filter(ctx, {
                filter: saturation,
                value,
                clip: selectionPath,
                staging: stagingCtx
              })
            )
          );
        }
      };
    default:
      break;
  }
}
