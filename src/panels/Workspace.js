import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";

import styled from "styled-components";

import Layer from "../components/Layer";

import TransformObject from "../components/TransformObject";

import { 
  PencilAction,
  BrushAction,
  FilterBrushAction,
  EraserAction,
  ShapeAction,
  EyeDropperAction,
  MoveAction,
  FillAction
} from "../utils/ToolAction";

import { getZoomAmount, calculateLayerClipping } from "../utils/helpers";
import { addOpacity, toArrayFromRgba } from "../utils/colorConversion.js";

import getCursor from "../utils/cursors";

import manipulate from "../reducers/custom/manipulateReducer";

import { updateWorkspaceSettings, setImportImageFile, createLayer, setTransformSelection, putHistoryDataMultiple, updateSelectionPath } from "../actions/redux";
import FilterTool from "../components/FilterTool";
import HelpModal from "../components/HelpModal";
import DropZone from "../components/DropZone";
import useEventListener from "../hooks/useEventListener";

import { filter } from "../utils/filters";

const WorkspaceSC = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  border: 1px solid black;
  overflow: hidden;
  background: rgb(175, 175, 175);
  cursor: ${props => props.cursor};
  z-index: 2;
`;

const ZoomDisplaySC = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  color: rgb(235, 235, 235);
  padding: 10px 20px;
  border-bottom-left-radius: 3px;
  pointer-events: none;
`;

const CanvasPaneSC = styled.div.attrs(props => ({
  style: {
    width: props.width,
    height: props.height,
    transform: `translateX(${props.translateX}px)
      translateY(${props.translateY}px)
      scale(${props.zoomPct / 100})`
  }
}))`
  position: relative;
  margin: auto;
  background: white;
  flex: none;
  pointer-events: none;
`;

let animationFrame = 0;
let lastFrame = 0;
let currentAction = null;
let isDrawing = false;

export default function Workspace() {
  const { translateX, translateY, zoomPct } = useSelector(state => state.ui.workspaceSettings);
  const primary = useSelector(state => state.ui.colorSettings.primary);
  const { activeTool, toolSettings } = useSelector(state => state.ui);
  const { documentWidth, documentHeight } = useSelector(state => state.main.present.documentSettings);
  const {
    activeLayer,
    selectionPath,
    selectionActive,
    transformSelectionTarget,
    layerCanvas,
    layerSettings,
    layerOrder,
    stagingPinnedTo
  } = useSelector(state => state.main.present);
  const overlayVisible = useSelector(state => state.ui.overlayVisible);
  const importImageFile = useSelector(state => state.ui.importImageFile);
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragOrigin, setDragOrigin] = useState({ x: null, y: null });

  const workspaceRef = useRef(null);
  let workspaceElement = workspaceRef.current;

  const dispatch = useDispatch();

  useEffect(() => {
    const reqFrame = requestAnimationFrame(updateAnimatedLayers);

    return () => cancelAnimationFrame(reqFrame);
  }, []);

  function updateAnimatedLayers() {
    const reqFrame = requestAnimationFrame(updateAnimatedLayers);
    animationFrame = reqFrame;
  }

  function getTranslateData(noOffset) {
    const marginLeft = .5 * (Math.floor(workspaceRef.current.clientWidth) - documentWidth * zoomPct / 100);
    const marginTop = .5 * (Math.floor(workspaceRef.current.clientHeight) - documentHeight * zoomPct / 100);
    return {
      x: -(translateX + marginLeft),
      y: -(translateY + marginTop),
      zoom: zoomPct / 100,
      offX: noOffset ? 0 : layerSettings[activeLayer].offset.x,
      offY: noOffset ? 0 : layerSettings[activeLayer].offset.y,
      documentWidth,
      documentHeight
    }
  }

  function eventIsWithinCanvas(ev) {
    const translateData = getTranslateData(),
      x = Math.floor(ev.nativeEvent.offsetX) + translateData.x,
      y = Math.floor(ev.nativeEvent.offsetY) + translateData.y;

    return x > 0 && y > 0 && x < documentWidth * zoomPct / 100 && y < documentHeight * zoomPct / 100; 
  }
  
  function buildAction() {
    switch (activeTool) {
      case "pencil":
        if (!activeLayer) {return}
        return new PencilAction(activeLayer, dispatch, getTranslateData(), {
          width: toolSettings.pencil.width,
          color: addOpacity(primary, toolSettings.pencil.opacity / 100),
          clip: selectionPath
        });
      case "brush":
        if (!activeLayer) {return}
        return new BrushAction(activeLayer, dispatch, getTranslateData(), {
          width: toolSettings.brush.width,
          color: primary,
          opacity: toolSettings.brush.opacity,
          hardness: toolSettings.brush.hardness,
          clip: selectionPath
        });
      case "line":
        if (!activeLayer) {return}
        return new ShapeAction(activeLayer, dispatch, getTranslateData(), {
          drawActionType: "drawLine",
          color: addOpacity(primary, toolSettings.line.opacity / 100),
          width: toolSettings.line.width,
          clip: selectionPath,
        });
      case "fillRect":
        if (!activeLayer) {return}
        return new ShapeAction(activeLayer, dispatch, getTranslateData(), {
          drawActionType: "fillRect",
          color: addOpacity(primary, toolSettings.fillRect.opacity / 100),
          regularOnShift: true,
          clip: selectionPath,
        });
      case "drawRect":
        if (!activeLayer) {return}
        return new ShapeAction(activeLayer, dispatch, getTranslateData(), {
          drawActionType: "drawRect",
          color: addOpacity(primary, toolSettings.drawRect.opacity / 100),
          width: toolSettings.drawRect.width,
          regularOnShift: true,
          clip: selectionPath,
        });
      case "fillEllipse":
        if (!activeLayer) {return}
        return new ShapeAction(activeLayer, dispatch, getTranslateData(), {
          drawActionType: "fillEllipse",
          color: addOpacity(primary, toolSettings.fillEllipse.opacity / 100),
          regularOnShift: true,
          clip: selectionPath,
        });
      case "drawEllipse":
        if (!activeLayer) {return}
        return new ShapeAction(activeLayer, dispatch, getTranslateData(), {
          drawActionType: "drawEllipse",
          color: addOpacity(primary, toolSettings.drawEllipse.opacity / 100),
          width: toolSettings.drawEllipse.width,
          regularOnShift: true,
          clip: selectionPath,
        });
      case "eraser":
        if (!activeLayer) {return}
        return new EraserAction(activeLayer, dispatch, getTranslateData(), {
          width: toolSettings.eraser.width,
          color: "rgba(0, 0, 0, 1)",
          opacity: 100,
          hardness: toolSettings.eraser.hardness,
          composite: "destination-out",
          clip: selectionPath
        });
      case "eyeDropper":
        return new EyeDropperAction(activeLayer, dispatch, getTranslateData(), {
          layerOrder: layerOrder
        });
      case "selectRect":
        return new ShapeAction(activeLayer, dispatch, getTranslateData(true), {
          drawActionType: "drawRect",
          regularOnShift: true,
          isSelectionTool: true,
          clip: selectionPath
        });
      case "selectEllipse":
        return new ShapeAction(activeLayer, dispatch, getTranslateData(true), {
          drawActionType: "drawEllipse",
          regularOnShift: true,
          isSelectionTool: true,
          clip: selectionPath
        });
      case "lasso":
        return new PencilAction(activeLayer, dispatch, getTranslateData(true), {
          isSelectionTool: true,
          clip: selectionPath
        });
      case "move":
        if (!activeLayer || selectionActive) {return}
        return new MoveAction(activeLayer, dispatch, getTranslateData());
      case "bucketFill":
        if (!activeLayer) {return}
        return new FillAction(activeLayer, dispatch, getTranslateData(), {
          colorArray: toArrayFromRgba(primary, toolSettings.bucketFill.opacity / 100),
          tolerance: toolSettings.bucketFill.tolerance,
          clip: selectionPath
        });
      case "saturate":
        if (!activeLayer) {return}
        return new FilterBrushAction(activeLayer, dispatch, getTranslateData(), {
          width: toolSettings.saturate.width,
          hardness: toolSettings.saturate.hardness,
          filter: filter.saturation.apply,
          filterInput: {amount: toolSettings.saturate.amount},
          clip: selectionPath
        });
      case "dodge":
        if (!activeLayer) {return}
        return new FilterBrushAction(activeLayer, dispatch, getTranslateData(), {
          width: toolSettings.dodge.width,
          hardness: toolSettings.dodge.hardness,
          filter: filter.dodge.apply,
          filterInput: {amount: toolSettings.dodge.amount, range: toolSettings.dodge.range},
          clip: selectionPath
        });
      case "burn":
        if (!activeLayer) {return}
        return new FilterBrushAction(activeLayer, dispatch, getTranslateData(), {
          width: toolSettings.burn.width,
          hardness: toolSettings.burn.hardness,
          filter: filter.burn.apply,
          filterInput: {amount: toolSettings.burn.amount, range: toolSettings.burn.range},
          clip: selectionPath
        });
      case "blur":
        if (!activeLayer) {return}
        return new FilterBrushAction(activeLayer, dispatch, getTranslateData(), {
          width: toolSettings.blur.width,
          hardness: toolSettings.blur.hardness,
          filter: filter.blur.apply,
          filterInput: {amount: toolSettings.blur.amount, width: layerCanvas[activeLayer].width},
          clip: selectionPath
        });
      case "sharpen":
        if (!activeLayer) {return}
        return new FilterBrushAction(activeLayer, dispatch, getTranslateData(), {
          width: toolSettings.sharpen.width,
          hardness: toolSettings.sharpen.hardness,
          filter: filter.sharpen.apply,
          filterInput: {amount: toolSettings.sharpen.amount, width: layerCanvas[activeLayer].width},
          clip: selectionPath
        });
      default:
        break;
    }
  }

  const zoom = steps => {
    dispatch(
      updateWorkspaceSettings({ zoomPct: getZoomAmount(steps, zoomPct) })
    );
  };

  const zoomTool = (ev, zoomOut) => {
    let steps;
    if (!zoomOut) {
      steps = ev.shiftKey ? 2 : 1;
      zoom(steps);
      if (zoomPct * steps >= 100) {
        // HANDLE ZOOM IN STUFF
      }
    } else {
      steps = ev.shiftKey ? -2 : -1;
      zoom(steps);

      // Autocenter when zooming out
      if (getZoomAmount(steps, zoomPct) <= 100) {
        dispatch(updateWorkspaceSettings({ translateX: 0, translateY: 0 }));
      }
    }
  }

  const translate = (deltaX, deltaY) => {
    dispatch(
      updateWorkspaceSettings({
        translateX: translateX + deltaX,
        translateY: translateY + deltaY
      })
    );
  };

  const translateTool = ev => {
    const str = ev.shiftKey ? 3 : 1;
    let dir;
    let modifier = window.navigator.platform.includes("Mac")
      ? ev.metaKey
      : ev.ctrlKey;
    if (ev.deltaX && ev.deltaY) {
      // FIGURE THIS OUT LATER
      return;
    } else if (ev.deltaX) {
      dir = ev.deltaX > 0 ? -1 : 1;
      if (modifier) {
        translate(0, 10 * dir * str);
      } else {
        translate(10 * dir * str, 0);
      }
    } else if (ev.deltaY) {
      dir = ev.deltaY > 0 ? -1 : 1;
      if (modifier) {
        translate(10 * dir * str, 0);
      } else {
        translate(0, 10 * dir * str);
      }
    }
  }
  
  const handleMouseWheel = useCallback(ev => {
    ev.preventDefault();
    if (ev.buttons !== 0) {return}
    if (ev.altKey) {
      zoomTool(ev, ev.deltaY < 0);
    } else {
      translateTool(ev);
    }
  }, [translateX, translateY, zoomPct]);

  useEventListener("wheel", handleMouseWheel, workspaceElement);

  const handleMouseDown = ev => {
    if (ev.buttons === 4 || activeTool === "hand") {
      setIsDragging(true);
      setDragOrigin({
        x: (Math.floor(ev.screenX) - translateX) * 100 / zoomPct,
        y: (Math.floor(ev.screenY) - translateY) * 100 / zoomPct
      });
    } else if (ev.buttons === 1) {
      if (activeTool === "move" && selectionActive) {
        const activeCtx = layerCanvas[activeLayer].getContext("2d"),
          selectionCtx = layerCanvas.selection.getContext("2d"),
          placeholderCtx = layerCanvas.placeholder.getContext("2d");
        manipulate(placeholderCtx, {
          action: "paste",
          params: {
            sourceCtx: activeCtx,
            dest: {x: 0, y: 0},
            clip: selectionPath,
            clearFirst: true
          }
        })
        dispatch(putHistoryDataMultiple([activeLayer, "selection"], [activeCtx, selectionCtx], [
          () => {
          manipulate(activeCtx, {
            action: "clear",
            params: {
              clip: selectionPath,
              clipOffset: layerSettings[activeLayer].offset
            }
          })
        }, () => {
          manipulate(selectionCtx, {
            action: "clear",
            params: { selectionPath: null }
          })
        }]));
        dispatch(updateSelectionPath(null, true));
        return dispatch(setTransformSelection(
          activeLayer,
          {startEvent: {button: 0, screenX: Math.floor(ev.screenX), screenY: Math.floor(ev.screenY)}},
          true
        ));
      }
      currentAction = buildAction();
      if (!currentAction) {return};
      currentAction.start(ev, layerCanvas);
      if (eventIsWithinCanvas(ev)) {isDrawing = true};
    }
  };
  
  const handleMouseLeave = (ev) => {
    if (currentAction && ev.buttons === 1) {
      if (isDrawing) {
        currentAction.end(layerCanvas);
        isDrawing = false;
      };
      currentAction = null;
    }
  };
  
  const handleMouseMove = ev => {
    if (isDragging) {
      if (animationFrame === lastFrame) return;
      lastFrame = animationFrame;
      const newTranslateX = Math.floor(ev.screenX) - dragOrigin.x * (zoomPct / 100);
      const newTranslateY = Math.floor(ev.screenY) - dragOrigin.y * (zoomPct / 100);
      dispatch(
        updateWorkspaceSettings({
          translateX: newTranslateX,
          translateY: newTranslateY
        })
      );
    } else if (currentAction && ev.buttons === 1) {
      currentAction.move(ev, layerCanvas);
      if (!isDrawing && eventIsWithinCanvas(ev)) {isDrawing = true};
    }
  };
    
  const handleMouseUp = ev => {
    if (ev.button === 1 || (ev.button === 0 && activeTool === "hand")) {
      setIsDragging(false);
      setDragOrigin({ x: null, y: null });
    } else if (ev.button === 0 && activeTool === "zoom") {
      zoomTool(ev, ev.altKey);
    } else if (currentAction && ev.button === 0) {
      if (isDrawing || currentAction.alwaysFire) {
        currentAction.end(layerCanvas);
        isDrawing = false;
      };
      currentAction = null;
    }
  };

  const handleDrop = async ev => {
    let file;
    if (ev.dataTransfer.items) {
      for (let i = 0; i < ev.dataTransfer.items.length; i++) {
        if (ev.dataTransfer.items[i].kind === 'file') {
          file = ev.dataTransfer.items[i].getAsFile();
          break;
        }
      }
    } else {
      file = ev.dataTransfer.files[0];
    }
    if (!file || !file.type.startsWith("image")) {return}
    const name = file.name.replace(/\.[^/.]+$/, "");
    await dispatch(createLayer(layerOrder.length, false, {name}));
    dispatch(setImportImageFile(file));
  }
  
  return (
    <WorkspaceSC
      ref={workspaceRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      cursor={getCursor(isDragging ? "activeHand" : activeTool)}
    >
      <DropZone onDrop={handleDrop} />
      <CanvasPaneSC
        translateX={translateX}
        translateY={translateY}
        width={documentWidth}
        height={documentHeight}
        zoomPct={zoomPct}
      >
        <LayerRenderer
          layerOrder={layerOrder}
          layerCanvas={layerCanvas}
          layerSettings={layerSettings}
          stagingPinnedTo={stagingPinnedTo}
          docSize={{w: documentWidth, h: documentHeight}}
        />
      </CanvasPaneSC>
      {importImageFile && <TransformObject
        source={importImageFile}
        target={layerOrder[layerOrder.length - 1]}
        targetCtx={layerCanvas[layerOrder[layerOrder.length - 1]].getContext("2d")}
      />}
      {
        transformSelectionTarget && <TransformObject
          source={layerCanvas.placeholder}
          target={transformSelectionTarget}
          targetCtx={layerCanvas[transformSelectionTarget].getContext("2d")}
          targetOffset={layerSettings[transformSelectionTarget].offset}
          docSize={{w: documentWidth, h: documentHeight}}
          index={layerOrder.indexOf(stagingPinnedTo) + 1}
        />
      }
      <ZoomDisplaySC>Zoom: {Math.ceil(zoomPct * 100) / 100}%</ZoomDisplaySC>
      {overlayVisible === "filterTool" && <FilterTool />}
      {overlayVisible === "helpModal" && <HelpModal />}
    </WorkspaceSC>
  );
}

function LayerRenderer({
  layerOrder,
  layerCanvas,
  layerSettings,
  stagingPinnedTo,
  docSize
}) {
  return (
    <>
      <Layer
        id={"clipboard"}
        docSize={docSize}
        index={1}
        data={layerCanvas.clipboard}
        hidden
      />
      <Layer
        id={"placeholder"}
        docSize={docSize}
        index={1}
        data={layerCanvas.placeholder}
        hidden
      />
      {layerOrder.length !== 0 &&
        layerOrder.map((layerId, i) => {
          let layerDat = layerCanvas[layerId];
          let layerSet = layerSettings[layerId];
          return <Layer
            key={layerId}
            id={layerId}
            docSize={docSize}
            size={layerSet.size}
            offset={layerSet.offset}
            index={i + 1}
            data={layerDat}
            hidden={layerSet.hidden}
            edgeClip={
              calculateLayerClipping(layerSet.size, layerSet.offset, docSize)
            }
          />
        })}
      <Layer
        id={"selection"}
        docSize={docSize}
        index={layerOrder.length + 2}
        data={layerCanvas.selection}
      />
      {
        stagingPinnedTo && <Layer
          key={"staging"}
          id={"staging"}
          docSize={docSize}
          size={layerSettings[stagingPinnedTo].size}
          offset={layerSettings[stagingPinnedTo].offset}
          index={stagingPinnedTo === "selection" ? layerOrder.length + 2 : layerOrder.indexOf(stagingPinnedTo) + 1}
          data={layerCanvas.staging}
          edgeClip={calculateLayerClipping(layerSettings[stagingPinnedTo].size, layerSettings[stagingPinnedTo].offset, docSize, 1)}
        />
      }
    </>
  );
}
