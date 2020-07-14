import getImageRect from "../../utils/getImageRect";

import { updateLayerPosition } from "../redux/index";

export default function moveLayer(id, moveData) {
  return (dispatch, getState) => {
    const ctx = getState().main.present.layerCanvas[id].getContext("2d");
    const canvasRect = getImageRect(ctx.canvas);
    const redrawData = ctx.getImageData(canvasRect.x, canvasRect.y, canvasRect.w, canvasRect.h);
    dispatch(dispatch => {
      dispatch(updateLayerPosition(
        id,
        moveData.size,
        moveData.offset,
        true
      ));
      if (redrawData) {
        ctx.canvas.width = moveData.size.w;
        ctx.canvas.height = moveData.size.h;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.canvas.getContext("2d").putImageData(redrawData, Math.max(0, moveData.offset.x + moveData.rect.x), Math.max(0, moveData.offset.y + moveData.rect.y));
      }
    });
  }
}