import { putHistoryData } from "./index"; 

export default function filterAction(filter, input, preview) {
  return (dispatch, getState) => {
    const { activeLayer, selectionPath } = getState().main.present;
    const ctx = getState().main.present.layerData[activeLayer].getContext("2d");
    const stagingCtx = getState().main.present.layerData.staging.getContext("2d");
    if (preview) {
      previewFilter(ctx, {
        filter,
        input,
        clip: selectionPath,
        staging: stagingCtx,
      })
    } else {
      dispatch(
        putHistoryData(activeLayer, ctx, () =>
          applyFilter(ctx, {
            filter,
            input,
            clip: selectionPath,
            staging: stagingCtx,
          })
        )
      );
    }
  };
}

function applyFilter(ctx, {filter, input, clip, staging}) {
  ctx.save();
  if (clip) {ctx.clip(clip)};
  staging.clearRect(0, 0, staging.canvas.width, staging.canvas.height);
  staging.drawImage(ctx.canvas, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const imageData = staging.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  filter(imageData.data, input)
  staging.putImageData(imageData, 0, 0)
  ctx.drawImage(staging.canvas, 0, 0);
  staging.clearRect(0, 0, staging.canvas.width, staging.canvas.height);
  ctx.restore();
}

function previewFilter(ctx, {filter, input, clip, staging}) {
  staging.save();
  if (clip) {staging.clip(clip)};
  staging.clearRect(0, 0, staging.canvas.width, staging.canvas.height);
  staging.drawImage(ctx.canvas, 0, 0);
  const imageData = staging.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  filter(imageData.data, input)
  staging.putImageData(imageData, 0, 0)
  staging.restore();
}