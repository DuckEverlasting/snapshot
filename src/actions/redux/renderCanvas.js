import manipulate from "../../reducers/custom/manipulateReducer";

export default function renderCanvas() {
  return (dispatch, getState) => {
    const {
      layerCanvas,
      layerSettings,
      layerOrder,
      stagingPinnedTo
    } = getState().main.present;

    const mainCtx = layerCanvas.main.getContext("2d");
    mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height);

    for (let i = 0; i < layerOrder.length; i++) {
      const current = layerOrder[i]
      
      if (layerSettings[current].hidden) continue;
      manipulate(mainCtx, {
        action: "paste",
        params: {
          sourceCtx: layerCanvas[current].getContext("2d"),
          dest: {x: 0, y: 0}
        }
      })
      if (stagingPinnedTo === current) {
        manipulate(mainCtx, {
          action: "paste",
          params: {
            sourceCtx: layerCanvas.staging.getContext("2d"),
            dest: {x: 0, y: 0}
          }
        })
      }
    }
    manipulate(mainCtx, {
      action: "paste",
      params: {
        sourceCtx: layerCanvas.selection.getContext("2d"),
        dest: {x: 0, y: 0}
      }
    })
    if (stagingPinnedTo === "selection") {
      manipulate(mainCtx, {
        action: "paste",
        params: {
          sourceCtx: layerCanvas.staging.getContext("2d"),
          dest: {x: 0, y: 0}
        }
      })
    }
  }
}