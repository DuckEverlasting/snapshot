import draw from "../../reducers/custom/drawingReducer";
import manipulate from "../../reducers/custom/manipulateReducer";

export default function renderCanvas(params={}) {
  return (_dispatch, getState) => {
    requestAnimationFrame(() => {
      const activeProject = getState().main.activeProject;
      if (!activeProject) {return;}
      const {
        layerCanvas,
        layerSettings,
        renderOrder,
        selectionPath,
        selectionActive,
      } = getState().main.projects[activeProject].present,
        stagingPinnedTo = getState().main.stagingPinnedTo,
        mainCanvas = getState().main.mainCanvas,
        utilityCanvas = getState().main.utilityCanvas,
        dpi = getState().ui.dpi,
        { documentWidth, documentHeight } = getState().main.projects[activeProject].present.documentSettings,
        { translateX, translateY, zoomPct } = getState().ui.workspaceSettings,
        docRect = { x: translateX, y: translateY, w: documentWidth, h: documentHeight },
        zoom = zoomPct / 100,
        ctx = mainCanvas.getContext("2d"),
        tempCtx = new OffscreenCanvas(mainCanvas.width / dpi, mainCanvas.height / dpi).getContext('2d');
        tempCtx.imageSmoothingEnabled = false;

  
      if (params.clearAll) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      }

      if (!params.noClear) {
        draw(tempCtx, {
          action: "fillRect",
          params: {
            orig: { x: docRect.x, y: docRect.y },
            dest: { x: (docRect.x + docRect.w * zoom), y: (docRect.y + docRect.h * zoom) },
            // Change this to svg grid pattern
            fillColor: "rgb(255, 255, 255)",
          }
        });
      }
      
      const start = params.start || 0,
        end = params.end || renderOrder.length;
  
      for (let i = start; i < end; i++) {
        const current = renderOrder[i]
        const { offset, blend, opacity } = layerSettings[current];

        if (layerSettings[current].hidden || opacity === 0) continue;
        manipulate(tempCtx, {
          action: "paste",
          params: {
            sourceCtx: layerCanvas[current].getContext("2d"),
            dest: { x: offset.x + docRect.x, y: offset.y + docRect.y },
            size: { w: docRect.w * zoom, h: docRect.h * zoom },
            globalAlpha: opacity / 100,
            composite: blend
          }
        });
        if (stagingPinnedTo === current) {
          manipulate(tempCtx, {
            action: "paste",
            params: {
              sourceCtx: utilityCanvas.staging.getContext("2d"),
              dest: { x: offset.x + docRect.x, y: offset.y + docRect.y },
              size: { w: docRect.w * zoom, h: docRect.h * zoom },
              globalAlpha: opacity / 100,
              composite: blend
            }
          });
        }
      }
      
      if (selectionActive) {  
        tempCtx.save();
        tempCtx.translate(.5, .5);
        tempCtx.strokeStyle = "rgba(0, 0, 0, 1)";
        tempCtx.setLineDash([7, 7]);
        tempCtx.lineWidth = Math.ceil(1 / zoom);
        tempCtx.stroke(selectionPath);
        tempCtx.strokeStyle = "rgba(255, 255, 255, 1)";
        tempCtx.lineDashOffset = 7;
        tempCtx.stroke(selectionPath);
        tempCtx.restore();
      }
        
      if (stagingPinnedTo === "selection") {
        manipulate(tempCtx, {
          action: "paste",
          params: {
            sourceCtx: utilityCanvas.staging.getContext("2d"),
            dest: { x: docRect.x, y: docRect.y },
            size: { w: docRect.w * zoom, h: docRect.h * zoom }
          }
        });
      }
      manipulate(ctx, {
        action: "paste",
        params: {
          sourceCtx: tempCtx,
          dest: { x: 0, y: 0 },
          size: { w: mainCanvas.width, h: mainCanvas.height }
        }
      });
    });
    // Draw pixel grid (and selection?) here
  }
}
