import getImageRect from "../../../utils/getImageRect";

import { updateLayerPosition } from "../redux/index";

export default function moveLayer(id, moveData) {
  return async (dispatch, getState) => {
    const activeProject = getState().main.activeProject;
    if (!activeProject) {return;}
    const ctx = getState().main.projects[activeProject].present.layerCanvas[id].getContext("2d");
    const canvasRect = getImageRect(ctx.canvas);
    const redrawData = canvasRect ? ctx.getImageData(canvasRect.x, canvasRect.y, canvasRect.w, canvasRect.h) : null;
    await dispatch(updateLayerPosition(
      id,
      moveData.size,
      moveData.offset
    ));
    if (redrawData) {
      ctx.canvas.width = moveData.size.w;
      ctx.canvas.height = moveData.size.h;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.canvas.getContext("2d").putImageData(redrawData, Math.max(0, moveData.offset.x + moveData.rect.x), Math.max(0, moveData.offset.y + moveData.rect.y));
    }
  }
}