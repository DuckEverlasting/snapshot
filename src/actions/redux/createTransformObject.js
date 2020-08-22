import {
  putHistoryData,
  setTransformTarget,
  updateSelectionPath,
} from "./index";
import manipulate from "../../reducers/custom/manipulateReducer";

export default function createTransformObject(e) {
  return (dispatch, getState) => {
    const activeProject = getState().main.activeProject;
    if (!activeProject) {return;}
    const {
      layerCanvas,
      layerSettings,
      activeLayer,
      selectionPath,
    } = getState().main.projects[activeProject].present;
    const utilityCanvas = getState().main.utilityCanvas;

    const activeCtx = layerCanvas[activeLayer].getContext("2d"),
      placeholderCtx = utilityCanvas.placeholder.getContext("2d");

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
      putHistoryData(activeLayer, activeCtx, () => {
        manipulate(activeCtx, {
          action: "clear",
          params: {
            clip: selectionPath,
            clipOffset: layerSettings[activeLayer].offset,
          },
        });
      })
    );
    dispatch(
      setTransformTarget(activeLayer, {
        startEvent: {
          button: 0,
          screenX: Math.floor(e.screenX),
          screenY: Math.floor(e.screenY),
        },
      })
    );
    return dispatch(updateSelectionPath("clear"));
  };
}
