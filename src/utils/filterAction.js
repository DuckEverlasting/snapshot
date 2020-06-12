import { putHistoryData, updateStagingPosition } from "../actions/redux/index";

import render from "../actions/redux/renderCanvas";

export default function filterAction(apply, input, preview) {
  return (dispatch, getState) => {
    const { activeLayer, selectionPath, stagingPinnedTo } = getState().main.present;
    if (!activeLayer) return;
    const ctx = getState().main.present.layerCanvas[activeLayer].getContext("2d");
    const stagingCtx = getState().main.present.layerCanvas.staging.getContext("2d");
    if (stagingPinnedTo !== activeLayer) dispatch(updateStagingPosition(activeLayer));
    if (preview) {
      previewFilter(ctx, {
        apply,
        input,
        clip: selectionPath,
        staging: stagingCtx,
      })
    } else {
      dispatch(
        putHistoryData(activeLayer, ctx, () =>
          applyFilter(ctx, {
            apply,
            input,
            clip: selectionPath,
            staging: stagingCtx,
          })
        )
      );
    }
    return dispatch(render());
  };
}

function applyFilter(ctx, {apply, input, clip, staging}) {
  ctx.save();
  if (clip) {ctx.clip(clip)};
  staging.clearRect(0, 0, staging.canvas.width, staging.canvas.height);
  staging.drawImage(ctx.canvas, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const imageData = staging.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  apply(imageData.data, input)
  staging.putImageData(imageData, 0, 0)
  ctx.drawImage(staging.canvas, 0, 0);
  staging.clearRect(0, 0, staging.canvas.width, staging.canvas.height);
  ctx.restore();
}

function previewFilter(ctx, {apply, input, clip, staging}) {
  staging.save();
  if (clip) {staging.clip(clip)};
  staging.clearRect(0, 0, staging.canvas.width, staging.canvas.height);
  staging.drawImage(ctx.canvas, 0, 0);
  const imageData = staging.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  apply(imageData.data, input)
  staging.putImageData(imageData, 0, 0)
  staging.restore();
}