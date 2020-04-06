import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";

import styled from "styled-components";

import Layer from "../components/Layer";

import { 
  PencilAction,
  BrushAction,
  ShapeAction,
  EyeDropperAction,
  MoveAction,
  FillAction
} from "../utils/ToolAction";

import { getZoomAmount } from "../utils/helpers";
import { addOpacity, toArrayFromRgba } from "../utils/colorConversion.js";

import getCursor from "../utils/cursors";

import { updateWorkspaceSettings } from "../actions/redux";
import FilterTool from "../components/FilterTool";
import HelpModal from "../components/HelpModal";

const WorkspaceSC = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  border: 1px solid black;
  overflow: hidden;
  background: rgb(175, 175, 175);
  cursor: ${props => props.cursor};
`;

const ZoomDisplaySC = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  color: rgb(235, 235, 235);
  padding: 10px 20px;
  border-bottom-left-radius: 3px;
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
  const { canvasWidth, canvasHeight } = useSelector(state => state.main.present.documentSettings);
  const {
    activeLayer,
    selectionPath,
    layerData,
    layerSettings,
    layerOrder,
    stagingPinnedTo
  } = useSelector(state => state.main.present);
  const overlayVisible = useSelector(state => state.ui.overlayVisible);
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragOrigin, setDragOrigin] = useState({ x: null, y: null });

  const workspaceRef = useRef(null);

  const dispatch = useDispatch();

  useEffect(() => {
    const reqFrame = requestAnimationFrame(updateAnimatedLayers);

    return () => cancelAnimationFrame(reqFrame);
  }, []);
  
  useEffect(() => {
    let workspaceElement = workspaceRef.current;
    workspaceElement.addEventListener("wheel", handleMouseWheel);

    return () => {
      workspaceElement.removeEventListener("wheel", handleMouseWheel);
    };
  }, [dispatch, translateX, translateY, zoomPct]);

  function updateAnimatedLayers() {
    const reqFrame = requestAnimationFrame(updateAnimatedLayers);
    animationFrame = reqFrame;
  }

  function getTranslateData() {
    const marginLeft = .5 * (workspaceRef.current.clientWidth - canvasWidth * zoomPct / 100);
    const marginTop = .5 * (workspaceRef.current.clientHeight - canvasHeight * zoomPct / 100);
    return {
      x: -(translateX + marginLeft),
      y: -(translateY + marginTop),
      zoom: zoomPct
    }
  }

  function eventIsWithinCanvas(ev) {
    const translateData = getTranslateData(),
      x = ev.nativeEvent.offsetX + translateData.x,
      y = ev.nativeEvent.offsetY + translateData.y;

    return x > 0 && y > 0 && x < canvasWidth && y < canvasWidth; 
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
        return new BrushAction(activeLayer, dispatch, getTranslateData(), {
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
        return new ShapeAction(activeLayer, dispatch, getTranslateData(), {
          drawActionType: "drawRect",
          color: "rgba(0, 0, 0, 1)",
          width: 1,
          dashPattern: [5, 10],
          regularOnShift: true,
          isSelectionTool: true,
          clip: selectionPath
        });
      case "selectEllipse":
        return new ShapeAction(activeLayer, dispatch, getTranslateData(), {
          drawActionType: "drawEllipse",
          color: "rgba(0, 0, 0, 1)",
          width: 1,
          dashPattern: [5, 10],
          regularOnShift: true,
          isSelectionTool: true,
          clip: selectionPath
        });
      case "lasso":
        return new PencilAction(activeLayer, dispatch, getTranslateData(), {
          isSelectionTool: true,
          clip: selectionPath
        });
      case "move":
        if (!activeLayer) {return}
        return new MoveAction(activeLayer, dispatch, getTranslateData());
      case "bucketFill":
        if (!activeLayer) {return}
        return new FillAction(activeLayer, dispatch, getTranslateData(), {
          colorArray: toArrayFromRgba(primary, toolSettings.bucketFill.opacity / 100),
          tolerance: toolSettings.bucketFill.tolerance,
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
  
  const handleMouseWheel = ev => {
    ev.preventDefault();
    if (ev.altKey) {
      zoomTool(ev, ev.deltaY < 0);
    } else {
      translateTool(ev);
    }
  };

  const handleMouseDown = ev => {
    if (ev.buttons === 4 || activeTool === "hand") {
      setIsDragging(true);
      setDragOrigin({
        x: (ev.screenX - translateX) * 100 / zoomPct,
        y: (ev.screenY - translateY) * 100 / zoomPct
      });
    } else if (ev.buttons === 1) {
      currentAction = buildAction();
      if (!currentAction) {return};
      currentAction.start(ev, layerData);
      if (eventIsWithinCanvas(ev)) {isDrawing = true};
    }
  };
  
  const handleMouseLeave = (ev) => {
    if (currentAction && ev.buttons === 1) {
      if (isDrawing) {
        currentAction.end(layerData);
        isDrawing = false;
      };
      currentAction = null;
    }
  };
  
  const handleMouseMove = ev => {
    if (isDragging) {
      if (animationFrame === lastFrame) return;
      lastFrame = animationFrame;
      const newTranslateX = ev.screenX - dragOrigin.x * (zoomPct / 100);
      const newTranslateY = ev.screenY - dragOrigin.y * (zoomPct / 100);
      dispatch(
        updateWorkspaceSettings({
          translateX: newTranslateX,
          translateY: newTranslateY
        })
      );
    } else if (currentAction && ev.buttons === 1) {
      currentAction.move(ev, layerData);
      if (!isDrawing && eventIsWithinCanvas(ev)) {isDrawing = true};
    }
  };
    
  const handleMouseUp = ev => {
    if (ev.button === 1 || ev.button === 0 && activeTool === "hand") {
      setIsDragging(false);
      setDragOrigin({ x: null, y: null });
    } else if (ev.button === 0 && activeTool === "zoom") {
      zoomTool(ev, ev.altKey);
    } else if (currentAction && ev.button === 0) {
      if (isDrawing) {
        currentAction.end(layerData);
        isDrawing = false;
      };
      currentAction = null;
    }
  };
  
  return (
    <WorkspaceSC
      ref={workspaceRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      cursor={getCursor(isDragging ? "activeHand" : activeTool)}
    >
      <CanvasPaneSC
        translateX={translateX}
        translateY={translateY}
        width={canvasWidth}
        height={canvasHeight}
        zoomPct={zoomPct}
        >
        <LayerRenderer
          layerOrder={layerOrder}
          layerData={layerData}
          layerSettings={layerSettings}
          stagingPinnedTo={stagingPinnedTo}
          width={canvasWidth}
          height={canvasHeight}
          />
      </CanvasPaneSC>
      <ZoomDisplaySC>Zoom: {Math.ceil(zoomPct * 100) / 100}%</ZoomDisplaySC>
      {overlayVisible === "filterTool" && <FilterTool />}
      {overlayVisible === "helpModal" && <HelpModal />}
    </WorkspaceSC>
  );
}

function LayerRenderer({
  layerOrder,
  layerData,
  layerSettings,
  stagingPinnedTo,
  width,
  height
}) {
  return (
    <>
      <Layer
        id={"clipboard"}
        width={width}
        height={height}
        index={1}
        data={layerData.clipboard}
        hidden={true}
        opacity={1}
      />
      {layerOrder.length !== 0 &&
        layerOrder.map((layerId, i) => {
          let layerDat = layerData[layerId];
          let layerSet = layerSettings[layerId];
          return <Layer
            key={layerId}
            id={layerId}
            width={width}
            height={height}
            index={i + 1}
            data={layerDat}
            hidden={layerSet.hidden}
            opacity={layerSet.opacity}
          />
        })}
      <Layer
        id={"selection"}
        width={width}
        height={height}
        index={layerOrder.length + 4}
        data={layerData.selection}
        hidden={false}
        opacity={1}
      />
      <Layer
        key={"staging"}
        id={"staging"}
        width={width}
        height={height}
        index={stagingPinnedTo === "selection" ? layerOrder.length + 4 : stagingPinnedTo + 1}
        data={layerData.staging}
        hidden={false}
        opacity={1}
      />
    </>
  );
}
