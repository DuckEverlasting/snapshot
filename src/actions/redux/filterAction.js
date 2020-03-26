import { putHistoryData } from "./index"; 

export default function filterAction(filter, input) {
  return (dispatch, getState) => {
    const { activeLayer, selectionPath } = getState().main.present;
    const ctx = getState().main.present.layerData[activeLayer].getContext("2d");
    const stagingCtx = getState().main.present.layerData.staging.getContext("2d");
    if (!selectionPath) {
      return;
    } else {
      dispatch(
        putHistoryData(activeLayer, ctx, () =>
          applyFilter(ctx, {
            filter,
            input,
            clip: selectionPath,
            staging: stagingCtx
          })
        )
      );
    }
  };
}

function applyFilter(ctx, {filter, input, clip, staging}) {
  ctx.save();
  ctx.clip(clip);
  staging.drawImage(ctx.canvas, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const imageData = staging.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  filter(imageData.data, input)
  staging.putImageData(imageData, 0, 0)
  ctx.drawImage(staging.canvas, 0, 0);
  staging.clearRect(0, 0, staging.canvas.width, staging.canvas.height);
  ctx.restore();
}