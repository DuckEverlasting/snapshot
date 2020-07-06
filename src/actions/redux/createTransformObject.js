import {
  putHistoryDataMultiple,
  setTransformTarget,
  updateSelectionPath,
} from "./index";
import manipulate from "../../reducers/custom/manipulateReducer";

export default function createTransformObject(ev) {
  return (dispatch, getState) => {
    const {
      layerCanvas,
      layerSettings,
      activeLayer,
      selectionPath,
    } = getState().main.present;

    const activeCtx = layerCanvas[activeLayer].getContext("2d"),
      selectionCtx = layerCanvas.selection.getContext("2d"),
      placeholderCtx = layerCanvas.placeholder.getContext("2d");

    manipulate(placeholderCtx, {
      action: "paste",
      params: {
        sourceCtx: activeCtx,
        dest: { x: 0, y: 0 },
        clip: selectionPath,
        clearFirst: true,
      },
    });
    dispatch(
      putHistoryDataMultiple(
        [activeLayer, "selection"],
        [activeCtx, selectionCtx],
        [
          () => {
            manipulate(activeCtx, {
              action: "clear",
              params: {
                clip: selectionPath,
                clipOffset: layerSettings[activeLayer].offset,
              },
            });
          },
          () => {
            console.log("DOIN THIS")
            manipulate(selectionCtx, {
              action: "clear",
              params: { selectionPath: null },
            });
          },
        ]
      )
    );
    dispatch(
      setTransformTarget(activeLayer, {
        startEvent: {
          button: 0,
          screenX: Math.floor(ev.screenX),
          screenY: Math.floor(ev.screenY),
        },
      })
    );
    return dispatch(updateSelectionPath(null));
  };
}
