import draw from "../../reducers/custom/drawingReducer";
import manipulate from "../../reducers/custom/manipulateReducer";
import { getCanvas } from '../../../utils/helpers';

const getGridPattern = zoom => {
  const dim = Math.max(zoom, 1);
  let pattern = getCanvas(dim, dim);
  const patternCtx = pattern.getContext("2d");
  patternCtx.lineWidth = 1;
  patternCtx.strokeStyle = 'rgba(128, 128, 128, 1)';
  patternCtx.beginPath();
  patternCtx.moveTo(-1, dim);
  patternCtx.lineTo(dim, dim);
  patternCtx.lineTo(dim, -1);
  patternCtx.stroke();
  return pattern;
};

export default function renderCanvas(params={}) {
  return (_dispatch, getState) => {
    requestAnimationFrame(() => {
      const activeProject = getState().main.activeProject;
      if (!activeProject) {
        return;
      }
      
      const { layerCanvas, layerSettings, renderOrder, selectionPath, selectionActive } = getState()
        .main.projects[activeProject]
        .present;
      const stagingPinnedTo = getState().main.stagingPinnedTo;
      const mainCanvas = getState().main.mainCanvas;
      const utilityCanvas = getState().main.utilityCanvas;
      const dpi = getState().ui.dpi;
      const { documentWidth, documentHeight } = getState()
        .main
        .projects[activeProject]
        .present
        .documentSettings;
      const { translateX, translateY, zoomPct } = getState().ui.workspaceSettings;
      const docRect = { x: translateX, y: translateY, w: documentWidth, h: documentHeight };
      const zoom = zoomPct / 100;
      const ctx = mainCanvas.getContext("2d");
      // Create offscreen canvas for staging (to be printed to the actual main canvas at the end of the process)
      const tempCtx = new OffscreenCanvas(mainCanvas.width / dpi, mainCanvas.height / dpi).getContext('2d');
      
      tempCtx.imageSmoothingEnabled = false;

      if (params.clearAll) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      }

      // Keep printing of layers restricted to the bounds of the document
      tempCtx.beginPath();
      tempCtx.rect(Math.floor(docRect.x), Math.floor(docRect.y), Math.floor(docRect.x + docRect.w * zoom - docRect.x), Math.floor(docRect.y + docRect.h * zoom - docRect.y));
      tempCtx.clip();

      // Fill document background with bgpattern
      if (!params.noClear) {
        draw(tempCtx, {
          action: "fillRect",
          params: {
            orig: { x: docRect.x, y: docRect.y },
            dest: { x: (docRect.x + docRect.w * zoom), y: (docRect.y + docRect.h * zoom) },
            fillColor: tempCtx.createPattern(getState().ui.bgPattern, "repeat")
          }
        });
      }

      const start = params.start || 0;
      const end = params.end || renderOrder.length;
  
      // Print to tempCtx specified layer range (default = all) in order
      for (let i = start; i < end; i++) {
        const current = renderOrder[i]
        const { offset, blend, opacity, size } = layerSettings[current];

        if (layerSettings[current].hidden || opacity === 0) continue;
        manipulate(tempCtx, {
          action: "paste",
          params: {
            sourceCtx: layerCanvas[current].getContext("2d"),
            dest: { x: offset.x * zoom + docRect.x, y: offset.y * zoom + docRect.y },
            size: { w: size.w * zoom, h: size.h * zoom },
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
        const timeOffset = (Date.now() / 100) % 20;
        tempCtx.save();
        tempCtx.translate(docRect.x, docRect.y);
        tempCtx.transform(zoom, 0, 0, zoom, 0, 0);
        tempCtx.strokeStyle = "rgba(0, 0, 0, 1)";
        tempCtx.lineWidth = 1 / zoom;
        tempCtx.setLineDash([10 / zoom, 10 / zoom]);
        tempCtx.lineDashOffset = timeOffset / zoom;
        tempCtx.stroke(selectionPath);
        tempCtx.strokeStyle = "rgba(255, 255, 255, 1)";
        tempCtx.lineDashOffset = (10 + timeOffset) / zoom;
        tempCtx.stroke(selectionPath);
        tempCtx.restore();
      }
        
      // TODO- Fix this so the line width matches above
      // Probably have to change the way staging canvas works for selection? ugh. sounds bad.
      // ...or it might be very, very simple.
      // prob not.
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

      if (zoom >= 20) {
        tempCtx.save();
        tempCtx.translate(docRect.x % zoom, docRect.y % zoom);
        draw(tempCtx, {
          action: "fillRect",
          params: {
            orig: { x: docRect.x - (docRect.x % zoom), y: docRect.y },
            dest: { x: (docRect.x + docRect.w * zoom) - (docRect.x % zoom), y: (docRect.y + docRect.h * zoom) - (docRect.y % zoom) },
            fillColor: tempCtx.createPattern(getGridPattern(zoom), "repeat")
          }
        });
        tempCtx.restore();
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
  }
}
