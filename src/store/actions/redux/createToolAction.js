import {
  PencilAction,
  BrushAction,
  FilterBrushAction,
  StampAction,
  EraserAction,
  ShapeAction,
  EyeDropperAction,
  MoveAction,
  FillAction,
  CropAction,
} from "../../../utils/ToolAction";

import createTransformObject from "./createTransformObject";
import selectFromActiveProject from "../../../utils/selectFromActiveProject";
import { filter } from "../../../utils/filters";
import { addOpacity, toArrayFromRgba } from "../../../utils/colorConversion";
import { setCurrentToolAction } from ".";

// TODO: ditto with current action (this means we can check what the current action is, yippee. maybe throw some name props on those classes there for fun)
// TODO: integrate with Workspace, test it out

export default function buildToolAction(e) {
  console.log(e)
  return async (dispatch, getState) => {
    const [activeLayer, selectionPath, selectionActive, layerCanvas, layerSettings, renderOrder] = selectFromActiveProject(
      "activeLayer", "selectionPath", "selectionActive", "layerCanvas", "layerSettings", "renderOrder"
    )(getState());
    const primary = getState().ui.colorSettings.primary;
    const { activeTool, toolSettings } = getState().ui;
    const { translateX, translateY, zoomPct } = getState().ui.workspaceSettings;
    const { documentWidth, documentHeight } = getState().main.projects[getState().main.activeProject].present.documentSettings;
    const { mainCanvas, utilityCanvas, stampData, lastEndpoint } = getState().main;

    function getTranslateData(params = {}) {
      return {
        x: translateX,
        y: translateY,
        zoom: zoomPct / 100,
        offX: params.noOffset ? 0 : layerSettings[activeLayer].offset.x,
        offY: params.noOffset ? 0 : layerSettings[activeLayer].offset.y,
        documentWidth,
        documentHeight,
      };
    }

    console.log(getTranslateData());

    let createdAction;

    switch (activeTool) {
      case "pencil":
        if (!activeLayer) { break; }
        if (toolSettings.pencil.smooth) {
          createdAction = new PencilAction(activeLayer, layerCanvas, utilityCanvas, dispatch, getTranslateData(), {
            width: toolSettings.pencil.width,
            color: addOpacity(primary, toolSettings.pencil.opacity / 100),
            clip: selectionPath,
            lastEndpoint
          });
        } else {
          createdAction = new BrushAction(activeLayer, layerCanvas, utilityCanvas, dispatch, getTranslateData(), {
            width: toolSettings.pencil.width,
            color: primary,
            opacity: toolSettings.pencil.opacity,
            hardness: 100,
            density: 0.1,
            clip: selectionPath,
            lastEndpoint
          });
        }
        break;
      case "brush":
        if (!activeLayer) { break; }
        createdAction = new BrushAction(activeLayer, layerCanvas, utilityCanvas, dispatch, getTranslateData(), {
          width: toolSettings.brush.width,
          color: primary,
          opacity: toolSettings.brush.opacity,
          hardness: toolSettings.brush.hardness,
          clip: selectionPath,
          lastEndpoint
        });
        break;
      case "line":
        if (!activeLayer) { break; }
        createdAction = new ShapeAction(activeLayer, layerCanvas, utilityCanvas, dispatch, getTranslateData(), {
          drawActionType: "drawLine",
          color: addOpacity(primary, toolSettings.line.opacity / 100),
          width: toolSettings.line.width,
          clip: selectionPath,
        });
        break;
      case "fillRect":
        if (!activeLayer) { break; }
        createdAction = new ShapeAction(activeLayer, layerCanvas, utilityCanvas, dispatch, getTranslateData(), {
          drawActionType: "fillRect",
          color: addOpacity(primary, toolSettings.fillRect.opacity / 100),
          regularOnShift: true,
          clip: selectionPath,
        });
        break;
      case "drawRect":
        if (!activeLayer) { break; }
        createdAction = new ShapeAction(activeLayer, layerCanvas, utilityCanvas, dispatch, getTranslateData(), {
          drawActionType: "drawRect",
          color: addOpacity(primary, toolSettings.drawRect.opacity / 100),
          width: toolSettings.drawRect.width,
          regularOnShift: true,
          clip: selectionPath,
        });
        break;
      case "fillEllipse":
        if (!activeLayer) { break; }
        createdAction = new ShapeAction(activeLayer, layerCanvas, utilityCanvas, dispatch, getTranslateData(), {
          drawActionType: "fillEllipse",
          color: addOpacity(primary, toolSettings.fillEllipse.opacity / 100),
          regularOnShift: true,
          clip: selectionPath,
        });
        break;
      case "drawEllipse":
        if (!activeLayer) { break; }
        createdAction = new ShapeAction(activeLayer, layerCanvas, utilityCanvas, dispatch, getTranslateData(), {
          drawActionType: "drawEllipse",
          color: addOpacity(primary, toolSettings.drawEllipse.opacity / 100),
          width: toolSettings.drawEllipse.width,
          regularOnShift: true,
          clip: selectionPath,
        });
        break;
      case "eraser":
        if (!activeLayer) { break; }
        createdAction = new EraserAction(activeLayer, layerCanvas, utilityCanvas, dispatch, getTranslateData(), {
          width: toolSettings.eraser.width,
          color: "rgba(0, 0, 0, 1)",
          opacity: 100,
          hardness: toolSettings.eraser.hardness,
          clip: selectionPath,
          lastEndpoint
        });
        break;
      case "eyeDropper":
        createdAction = new EyeDropperAction(activeLayer, layerCanvas, utilityCanvas, dispatch, getTranslateData(), {
          renderOrder: renderOrder,
        });
        break;
      case "selectRect":
        createdAction = new ShapeAction("selection", layerCanvas, utilityCanvas, dispatch, getTranslateData({ noOffset: true }), {
          drawActionType: "drawRect",
          regularOnShift: true
        });
        break;
      case "selectEllipse":
        createdAction = new ShapeAction("selection", layerCanvas, utilityCanvas, dispatch, getTranslateData({ noOffset: true }), {
          drawActionType: "drawEllipse",
          regularOnShift: true
        });
        break;
      case "lasso":
        createdAction = new PencilAction("selection", layerCanvas, utilityCanvas, dispatch, getTranslateData({ noOffset: true }), {
          clip: selectionPath,
          lastEndpoint
        });
        break;
      case "move":
        if (!activeLayer) {
          return;
        }
        if (selectionActive) {
          return dispatch(createTransformObject(e));
        } else {
          createdAction = new MoveAction(activeLayer, layerCanvas, utilityCanvas, dispatch, getTranslateData());
        }
        break;
      case "stamp":
        if (!activeLayer) { break; }
        createdAction = new StampAction(activeLayer, layerCanvas, utilityCanvas, dispatch, getTranslateData(), {
          stampData,
          width: toolSettings.stamp.width,
          hardness: toolSettings.stamp.hardness,
          opacity: toolSettings.stamp.opacity,
          clip: selectionPath,
          lastEndpoint
        });
        break;
      case "bucketFill":
        if (!activeLayer) { break; }
        createdAction = new FillAction(activeLayer, layerCanvas, utilityCanvas, dispatch, getTranslateData(), {
          colorArray: toArrayFromRgba(
            primary,
            toolSettings.bucketFill.opacity / 100
          ),
          tolerance: toolSettings.bucketFill.tolerance,
          clip: selectionPath,
        });
        break;
      case "selectionFill":
        if (!activeLayer) { break; }
        createdAction = new FillAction("selection", layerCanvas, utilityCanvas, dispatch, getTranslateData(), {
          tolerance: toolSettings.selectionFill.tolerance,
          selectionTarget: toolSettings.selectionFill.targetAll ? "all" : activeLayer,
          mainCanvas
        });
        break;
      case "saturate":
        if (!activeLayer) { break; }
        createdAction = new FilterBrushAction(activeLayer, layerCanvas, utilityCanvas, dispatch, getTranslateData(), {
          width: toolSettings.saturate.width,
          hardness: toolSettings.saturate.hardness,
          filter: filter.saturation.apply,
          filterInput: { amount: toolSettings.saturate.amount },
          clip: selectionPath,
          lastEndpoint
        });
        break;
      case "dodge":
        if (!activeLayer) { break; }
        createdAction = new FilterBrushAction(activeLayer, layerCanvas, utilityCanvas, dispatch, getTranslateData(), {
          width: toolSettings.dodge.width,
          hardness: toolSettings.dodge.hardness,
          filter: filter.dodge.apply,
          filterInput: {
            amount: toolSettings.dodge.amount,
            range: toolSettings.dodge.range,
          },
          clip: selectionPath,
          lastEndpoint
        });
        break;
      case "burn":
        if (!activeLayer) { break; }
        createdAction = new FilterBrushAction(activeLayer, layerCanvas, utilityCanvas, dispatch, getTranslateData(), {
          width: toolSettings.burn.width,
          hardness: toolSettings.burn.hardness,
          filter: filter.burn.apply,
          filterInput: {
            amount: toolSettings.burn.amount,
            range: toolSettings.burn.range,
          },
          clip: selectionPath,
          lastEndpoint
        });
        break;
      case "blur":
        if (!activeLayer) { break; }
        createdAction = new FilterBrushAction(activeLayer, layerCanvas, utilityCanvas, dispatch, getTranslateData(), {
          width: toolSettings.blur.width,
          hardness: toolSettings.blur.hardness,
          filter: filter.blur.apply,
          filterInput: {
            amount: toolSettings.blur.amount,
            width: layerCanvas[activeLayer].width,
          },
          clip: selectionPath,
          lastEndpoint
        });
        break;
      case "sharpen":
        if (!activeLayer) { break; }
        createdAction = new FilterBrushAction(activeLayer, layerCanvas, utilityCanvas, dispatch, getTranslateData(), {
          width: toolSettings.sharpen.width,
          hardness: toolSettings.sharpen.hardness,
          filter: filter.sharpen.apply,
          filterInput: {
            amount: toolSettings.sharpen.amount,
            width: layerCanvas[activeLayer].width,
          },
          clip: selectionPath,
          lastEndpoint
        });
        break;
      case "crop":
        createdAction = new CropAction(activeLayer, layerCanvas, utilityCanvas, dispatch, getTranslateData(), {
          clip: selectionPath
        });
        break;
      default:
        break;
    }
    createdAction.start(e);
    dispatch(setCurrentToolAction(createdAction));
  }
}