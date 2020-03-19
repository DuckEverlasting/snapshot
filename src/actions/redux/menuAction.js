import {
  switchColors,
  updateLayerQueue,
  updateSelectionPath,
  createLayer,
  deleteLayer,
  undo,
  redo
} from "./index";

export default function menuAction(action) {
  switch (action) {
    case "switchColors":
      return switchColors();
    case "deselect":
      return dispatch => {
        dispatch(
          updateLayerQueue("selection", {
            action: "clear",
            type: "draw",
            params: { selectionPath: null }
          })
        );
        dispatch(updateSelectionPath(null));
      };
    case "duplicate":
      return (dispatch, getState) => {
        const {
          layerCounter: newLayerId,
          activeLayer,
          selectionPath
        } = getState().main.present;
        const sourceCtx = getState().main.present.layerData[
          activeLayer
        ].getContext("2d");
        dispatch(createLayer(activeLayer));
        dispatch(
          updateLayerQueue(newLayerId, {
            type: "manipulate",
            action: "paste",
            params: {
              sourceCtx,
              dest: [0, 0],
              clip: selectionPath
            }
          })
        );
      };
    case "copy":
      return (dispatch, getState) => {
        const { activeLayer, selectionPath } = getState().main.present;
        const sourceCtx = getState().main.present.layerData[activeLayer].getContext("2d");
        dispatch(
          updateLayerQueue("clipboard", {
            type: "manipulate",
            action: "paste",
            params: {
              sourceCtx,
              dest: [0, 0],
              clip: selectionPath,
              clearFirst: true
            }
          })
        );
      };
    case "paste":
      return (dispatch, getState) => {
        const { activeLayer } = getState().main.present;
        const sourceCtx = getState().main.present.layerData.clipboard.getContext(
          "2d"
        );
        dispatch(
          updateLayerQueue(activeLayer, {
            type: "manipulate",
            action: "paste",
            params: {
              sourceCtx,
              dest: [0, 0]
            }
          })
        );
      };
    case "pasteToNew":
      return (dispatch, getState) => {
        const {
          layerCounter: newLayerId,
          activeLayer
        } = getState().main.present;
        const sourceCtx = getState().main.present.layerData.clipboard.getContext(
          "2d"
        );
        dispatch(createLayer(activeLayer));
        dispatch(
          updateLayerQueue(newLayerId, {
            type: "manipulate",
            action: "paste",
            params: {
              sourceCtx,
              dest: [0, 0],
              clearFirst: true
            }
          })
        );
      };
    case "undo":
      return undo();
    case "redo":
      return redo();
    case "newLayer":
      return (dispatch, getState) => {
        const { activeLayer, layerOrder } = getState().main.present;
        if (activeLayer) {
          dispatch(createLayer(activeLayer))
        } else {
          dispatch(createLayer(layerOrder.length))
        }
      }
    case "deleteLayer":
      return (dispatch, getState) => {
        const { activeLayer } = getState().main.present;
        if (activeLayer) {
          dispatch(deleteLayer(activeLayer))
        }
      }
    default:
      break;
  }
};
