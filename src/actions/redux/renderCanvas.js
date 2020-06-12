import manipulate from "../../reducers/custom/manipulateReducer";

export default function renderCanvas(start, end, params={}) {
  return (dispatch, getState) => {
    const {
      layerCanvas,
      layerSettings,
      layerOrder,
      stagingPinnedTo
    } = getState().main.present;

    const ctx = params.ctx ? params.ctx : layerCanvas.main.getContext("2d");
    
    if (!params.noClear) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    if (start === undefined) start = 0;
    if (end === undefined) end = layerOrder.length;

    for (let i = start; i < end; i++) {
      const current = layerOrder[i]
      const { offset, blend, size, opacity } = layerSettings[current];
      
      if (layerSettings[current].hidden) continue;
      manipulate(ctx, {
        action: "paste",
        params: {
          sourceCtx: layerCanvas[current].getContext("2d"),
          dest: offset,
          globalAlpha: opacity,
          composite: blend
        }
      })
      if (stagingPinnedTo === current) {
        manipulate(ctx, {
          action: "paste",
          params: {
            sourceCtx: layerCanvas.staging.getContext("2d"),
            dest: offset,
            globalAlpha: opacity,
            composite: blend
          }
        })
      }
    }
    manipulate(ctx, {
      action: "paste",
      params: {
        sourceCtx: layerCanvas.selection.getContext("2d"),
        dest: {x: 0, y: 0}
      }
    })
    if (stagingPinnedTo === "selection") {
      manipulate(ctx, {
        action: "paste",
        params: {
          sourceCtx: layerCanvas.staging.getContext("2d"),
          dest: {x: 0, y: 0}
        }
      })
    }
  }
}