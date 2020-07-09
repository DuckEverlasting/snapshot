import draw from "../../reducers/custom/drawingReducer";
import { MarchingSquaresOpt } from "../../utils/marchingSquares"
import { updateSelectionPath } from "./index";

export default function updateSelection() {
  const { getBlobOutlinePoints, getPathFromPointList } = MarchingSquaresOpt;

  return (dispatch, getState) => {
    const selectionCanvas = getState().main.present.layerCanvas.selection,
      selectionPath = getState().main.present.selectionPath,
      
    function getTempCtx(width, height, path) {
      const canvas = new OffscreenCanvas(width, height);
      draw(canvas.getContext("2d"), {
        action: "fillRect",
        params: {
          fillColor: "rgba(0,0,0,1)",
          clip: path
        }
      });
      return canvas.getContext("2d");
    }
    
    function getFullOutlinePath(ctx, pointList=null, prevLength=null, finalPath=new Path2D()) {
      if (!pointList) {
        pointList = getBlobOutlinePoints(ctx.canvas);
      }
      let path = getPathFromPointList(pointList);
      finalPath.addPath(path);
      ctx.save();
      ctx.translate(2, 0);
      ctx.clip(path);
      ctx.translate(-2, 0);
      ctx.clearRect(0, 0, documentWidth, documentHeight);
      ctx.restore();
      const nextPointList = getBlobOutlinePoints(ctx.canvas);
      if (nextPointList.length && nextPointList.length !== prevLength) {
        const nextPrevLength = nextPointList.length;
        return getFullOutlinePath(nextPointList, nextPrevLength, finalPath);
      } else {
        return finalPath;
      }
    }

    const newPath = getFullOutlinePath(getTempCtx(selectionCanvas.width, selectionCanvas.height, selectionPath));
  }
}