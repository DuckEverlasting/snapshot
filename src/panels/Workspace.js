import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";

import styled from "styled-components";

import TransformObject from "../components/TransformObject";
import CropObject from "../components/CropObject";

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
} from "../utils/ToolAction";

import { getZoomAmount } from "../utils/helpers";
import { addOpacity, toArrayFromRgba } from "../utils/colorConversion.js";

import getCursor from "../utils/cursors";

import createTransformObject from "../actions/redux/createTransformObject";

import {
  updateWorkspaceSettings,
  setImportImageFile,
  createLayer
} from "../actions/redux";

import DropZone from "../components/DropZone";
import useEventListener from "../hooks/useEventListener";

import { filter } from "../utils/filters";
import MainCanvas from "../components/MainCanvas";
import render from "../actions/redux/renderCanvas";

const WorkspaceSC = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  border: 1px solid black;
  overflow: hidden;
  background: rgb(175, 175, 175);
  cursor: ${(props) => props.cursor};
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

const NameDisplaySC = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
  color: rgb(235, 235, 235);
  padding: 10px 20px;
  border-bottom-right-radius: 3px;
  pointer-events: none;
`;

const CanvasPaneSC = styled.div.attrs((props) => ({
  style: {
    width: props.width,
    height: props.height,
    transform: `translateX(${props.translateX}px)
      translateY(${props.translateY}px)
      translateZ(-.001px)
      scale(${props.zoomPct / 100})`,
    marginTop: `-${.5 * props.height}px`,
    marginLeft: `-${.5 * props.width}px`,
    backgroundSize: `${1000 / props.zoomPct}px ${1000 / props.zoomPct}px`,
    backgroundPosition: `0 0, ${500 / props.zoomPct}px ${500 / props.zoomPct}px`
  },
}))`
  position: relative;
  top: 50%;
  left: 50%;
  background-color: #eee;
  background-image: linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc),
  linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc);
  flex: none;
  pointer-events: none;
`;

let animationFrame = 0;
let lastFrame = 0;
let currentAction = null;
let isDrawing = false;

export default function Workspace() {
  const { translateX, translateY, zoomPct } = useSelector(
    (state) => state.ui.workspaceSettings
  );
  const primary = useSelector((state) => state.ui.colorSettings.primary);
  const { activeTool, toolSettings, transformTarget, cropIsActive } = useSelector((state) => state.ui);
  const { documentWidth, documentHeight, documentName } = useSelector(
    (state) => state.main.present.documentSettings
  );
  const {
    activeLayer,
    selectionPath,
    selectionActive,
    layerCanvas,
    layerSettings,
    renderOrder,
    stampData,
  } = useSelector((state) => state.main.present);
  const importImageFile = useSelector((state) => state.ui.importImageFile);

  const [isDragging, setIsDragging] = useState(false);
  const [dragOrigin, setDragOrigin] = useState({ x: null, y: null });
  const [lastEndpoint, setLastEndpoint] = useState(null);
  const [keys, setKeys] = useState({
    shift: false,
    ctrl: false,
    alt: false,
  });
  const [workspaceDimensions, setWorkspaceDimensions] = useState({
    w: 0,
    h: 0
  })

  const workspaceRef = useRef(null);
  let workspaceElement = workspaceRef.current;

  const dispatch = useDispatch();

  useEffect(() => {
    function updateAnimatedLayers() {
      const reqFrame = requestAnimationFrame(updateAnimatedLayers);
      animationFrame = reqFrame;
    }

    const reqFrame = requestAnimationFrame(updateAnimatedLayers);

    return () => cancelAnimationFrame(reqFrame);
  }, []);

  useEffect(() => {
    if (workspaceRef.current) {
      setWorkspaceDimensions({
        w: workspaceRef.current.width,
        h: workspaceRef.current.height,
      })
    }
  }, [workspaceRef])

  function getTranslateData(noOffset) {
    const marginLeft =
      0.5 *
      (Math.floor(workspaceRef.current.clientWidth) -
        (documentWidth * zoomPct) / 100);
    const marginTop =
      0.5 *
      (Math.floor(workspaceRef.current.clientHeight) -
        (documentHeight * zoomPct) / 100);
    return {
      x: -(translateX + marginLeft),
      y: -(translateY + marginTop),
      zoom: zoomPct / 100,
      offX: noOffset ? 0 : layerSettings[activeLayer].offset.x,
      offY: noOffset ? 0 : layerSettings[activeLayer].offset.y,
      documentWidth,
      documentHeight,
    };
  }

  function eventIsWithinCanvas(ev) {
    const translateData = getTranslateData(),
      x = Math.floor(ev.nativeEvent.offsetX) + translateData.x,
      y = Math.floor(ev.nativeEvent.offsetY) + translateData.y;

    return (
      x > 0 &&
      y > 0 &&
      x < (documentWidth * zoomPct) / 100 &&
      y < (documentHeight * zoomPct) / 100
    );
  }

  function buildAction() {
    switch (activeTool) {
      case "pencil":
        if (!activeLayer) {return}
        return new PencilAction(activeLayer, layerCanvas, dispatch, getTranslateData(), {
          width: toolSettings.pencil.width,
          color: addOpacity(primary, toolSettings.pencil.opacity / 100),
          clip: selectionPath,
          lastEndpoint,
          setLastEndpoint
        });
      case "brush":
        if (!activeLayer) {return}
        return new BrushAction(activeLayer, layerCanvas, dispatch, getTranslateData(), {
          width: toolSettings.brush.width,
          color: primary,
          opacity: toolSettings.brush.opacity,
          hardness: toolSettings.brush.hardness,
          clip: selectionPath,
          lastEndpoint,
          setLastEndpoint
        });
      case "line":
        if (!activeLayer) {return}
        return new ShapeAction(activeLayer, layerCanvas, dispatch, getTranslateData(), {
          drawActionType: "drawLine",
          color: addOpacity(primary, toolSettings.line.opacity / 100),
          width: toolSettings.line.width,
          clip: selectionPath,
        });
      case "fillRect":
        if (!activeLayer) {return}
        return new ShapeAction(activeLayer, layerCanvas, dispatch, getTranslateData(), {
          drawActionType: "fillRect",
          color: addOpacity(primary, toolSettings.fillRect.opacity / 100),
          regularOnShift: true,
          clip: selectionPath,
        });
      case "drawRect":
        if (!activeLayer) {return}
        return new ShapeAction(activeLayer, layerCanvas, dispatch, getTranslateData(), {
          drawActionType: "drawRect",
          color: addOpacity(primary, toolSettings.drawRect.opacity / 100),
          width: toolSettings.drawRect.width,
          regularOnShift: true,
          clip: selectionPath,
        });
      case "fillEllipse":
        if (!activeLayer) {return}
        return new ShapeAction(activeLayer, layerCanvas, dispatch, getTranslateData(), {
          drawActionType: "fillEllipse",
          color: addOpacity(primary, toolSettings.fillEllipse.opacity / 100),
          regularOnShift: true,
          clip: selectionPath,
        });
      case "drawEllipse":
        if (!activeLayer) {return}
        return new ShapeAction(activeLayer, layerCanvas, dispatch, getTranslateData(), {
          drawActionType: "drawEllipse",
          color: addOpacity(primary, toolSettings.drawEllipse.opacity / 100),
          width: toolSettings.drawEllipse.width,
          regularOnShift: true,
          clip: selectionPath,
        });
      case "eraser":
        if (!activeLayer) {return}
        return new EraserAction(activeLayer, layerCanvas, dispatch, getTranslateData(), {
          width: toolSettings.eraser.width,
          color: "rgba(0, 0, 0, 1)",
          opacity: 100,
          hardness: toolSettings.eraser.hardness,
          composite: "destination-out",
          clip: selectionPath,
          lastEndpoint,
          setLastEndpoint
        });
      case "eyeDropper":
        return new EyeDropperAction(activeLayer, layerCanvas, dispatch, getTranslateData(), {
          renderOrder: renderOrder,
        });
      case "selectRect":
        return new ShapeAction("selection", layerCanvas, dispatch, getTranslateData(true), {
          drawActionType: "drawRect",
          regularOnShift: true
        });
      case "selectEllipse":
        return new ShapeAction("selection", layerCanvas, dispatch, getTranslateData(true), {
          drawActionType: "drawEllipse",
          regularOnShift: true
        });
      case "lasso":
        return new PencilAction("selection", layerCanvas, dispatch, getTranslateData(true), {
          clip: selectionPath,
          lastEndpoint,
          setLastEndpoint
        });
      case "move":
        if (!activeLayer || selectionActive) {
          return;
        }
        return new MoveAction(activeLayer, layerCanvas, dispatch, getTranslateData());
      case "stamp":
        if (!activeLayer) {return}
        return new StampAction(activeLayer, layerCanvas, dispatch, getTranslateData(), {
          stampData,
          width: toolSettings.stamp.width,
          hardness: toolSettings.stamp.hardness,
          opacity: toolSettings.stamp.opacity,
          clip: selectionPath,
          lastEndpoint,
          setLastEndpoint
        });
      case "bucketFill":
        if (!activeLayer) {return}
        return new FillAction(activeLayer, layerCanvas, dispatch, getTranslateData(), {
          colorArray: toArrayFromRgba(
            primary,
            toolSettings.bucketFill.opacity / 100
          ),
          tolerance: toolSettings.bucketFill.tolerance,
          clip: selectionPath,
        });
      case "selectionFill":
        if (!activeLayer) {return}
        return new FillAction("selection", layerCanvas, dispatch, getTranslateData(), {
          tolerance: toolSettings.selectionFill.tolerance,
          selectionTarget: toolSettings.selectionFill.targetAll ? "all" : activeLayer
        });
      case "saturate":
        if (!activeLayer) {return}
        return new FilterBrushAction(activeLayer, layerCanvas, dispatch, getTranslateData(), {
          width: toolSettings.saturate.width,
          hardness: toolSettings.saturate.hardness,
          filter: filter.saturation.apply,
          filterInput: { amount: toolSettings.saturate.amount },
          clip: selectionPath,
          lastEndpoint,
          setLastEndpoint
        });
      case "dodge":
        if (!activeLayer) {return}
        return new FilterBrushAction(activeLayer, layerCanvas, dispatch, getTranslateData(), {
          width: toolSettings.dodge.width,
          hardness: toolSettings.dodge.hardness,
          filter: filter.dodge.apply,
          filterInput: {
            amount: toolSettings.dodge.amount,
            range: toolSettings.dodge.range,
          },
          clip: selectionPath,
          lastEndpoint,
          setLastEndpoint
        });
      case "burn":
        if (!activeLayer) {return}
        return new FilterBrushAction(activeLayer, layerCanvas, dispatch, getTranslateData(), {
          width: toolSettings.burn.width,
          hardness: toolSettings.burn.hardness,
          filter: filter.burn.apply,
          filterInput: {
            amount: toolSettings.burn.amount,
            range: toolSettings.burn.range,
          },
          clip: selectionPath,
          lastEndpoint,
          setLastEndpoint
        });
      case "blur":
        if (!activeLayer) {return}
        return new FilterBrushAction(activeLayer, layerCanvas, dispatch, getTranslateData(), {
          width: toolSettings.blur.width,
          hardness: toolSettings.blur.hardness,
          filter: filter.blur.apply,
          filterInput: {
            amount: toolSettings.blur.amount,
            width: layerCanvas[activeLayer].width,
          },
          clip: selectionPath,
          lastEndpoint,
          setLastEndpoint
        });
      case "sharpen":
        if (!activeLayer) {return}
        return new FilterBrushAction(activeLayer, layerCanvas, dispatch, getTranslateData(), {
          width: toolSettings.sharpen.width,
          hardness: toolSettings.sharpen.hardness,
          filter: filter.sharpen.apply,
          filterInput: {
            amount: toolSettings.sharpen.amount,
            width: layerCanvas[activeLayer].width,
          },
          clip: selectionPath,
          lastEndpoint,
          setLastEndpoint
        });
      case "crop":
        return new CropAction(activeLayer, layerCanvas, dispatch, getTranslateData(), {
          clip: selectionPath
        });
      // case "TEST":
      //   break;
      default:
        break;
    }
  }

  const zoom = (steps) => {
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
    dispatch(render());
  };

  const translate = (deltaX, deltaY) => {
    dispatch(
      updateWorkspaceSettings({
        translateX: translateX + deltaX,
        translateY: translateY + deltaY,
      })
    );
  };

  const translateTool = (ev) => {
    const str = ev.shiftKey ? 3 : 1;
    let dir;
    let modifier = window.navigator.platform.includes("Mac")
      ? ev.metaKey
      : ev.ctrlKey;
    if (ev.deltaX && ev.deltaY) {
      // FIGURE THIS OUT LATER(?)
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
  };

  const handleMouseWheel = useCallback((ev) => {
      ev.preventDefault();
      if (ev.buttons !== 0) {return}
      if (ev.altKey) {
        zoomTool(ev, ev.deltaY < 0);
      } else {
        translateTool(ev);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [translateX, translateY, zoomPct]);

  useEventListener("wheel", handleMouseWheel, workspaceElement);

  const handleKeys = useCallback((ev) => {
    let modifier = window.navigator.platform.includes("Mac")
      ? ev.metaKey
      : ev.ctrlKey;
    setKeys({
      shift: ev.shiftKey,
      ctrl: modifier,
      alt: ev.altKey,
    });
  }, []);

  useEventListener("keydown", handleKeys);
  useEventListener("keyup", handleKeys);

  const handleMouseDown = (ev) => {
    if (ev.buttons === 4 || activeTool === "hand") {
      setIsDragging(true);
      setDragOrigin({
        x: ((Math.floor(ev.screenX) - translateX) * 100) / zoomPct,
        y: ((Math.floor(ev.screenY) - translateY) * 100) / zoomPct,
      });
    } else if (ev.buttons === 1) {
      if (activeTool === "move" && selectionActive) {
        return dispatch(createTransformObject(ev));
      }
      currentAction = buildAction();
      if (!currentAction) {return}
      currentAction.start(ev);
      if (eventIsWithinCanvas(ev)) {
        isDrawing = true;
      }
    }
  };

  const handleMouseLeave = (ev) => {
    if (currentAction && ev.buttons === 1) {
      if (isDrawing) {
        currentAction.end();
        isDrawing = false;
      }
      currentAction = null;
    }
  };

  const handleMouseMove = (ev) => {
    if (isDragging) {
      if (animationFrame === lastFrame) return;
      lastFrame = animationFrame;
      const newTranslateX =
        Math.floor(ev.screenX) - dragOrigin.x * (zoomPct / 100);
      const newTranslateY =
        Math.floor(ev.screenY) - dragOrigin.y * (zoomPct / 100);
      dispatch(
        updateWorkspaceSettings({
          translateX: newTranslateX,
          translateY: newTranslateY,
        })
      );
    } else if (currentAction && ev.buttons === 1) {
      currentAction.move(ev);
      if (!isDrawing && eventIsWithinCanvas(ev)) {
        isDrawing = true;
      }
    }
  };

  const handleMouseUp = (ev) => {
    if (ev.button === 1 || (ev.button === 0 && activeTool === "hand")) {
      setIsDragging(false);
      setDragOrigin({ x: null, y: null });
    } else if (ev.button === 0 && activeTool === "zoom") {
      zoomTool(ev, ev.altKey);
    } else if (currentAction && ev.button === 0) {
      if (isDrawing || currentAction.alwaysFire) {
        currentAction.end();
        isDrawing = false;
      }
      currentAction = null;
    }
  };

  const handleDrop = async (ev) => {
    let file;
    if (ev.dataTransfer.items) {
      for (let i = 0; i < ev.dataTransfer.items.length; i++) {
        if (ev.dataTransfer.items[i].kind === "file") {
          file = ev.dataTransfer.items[i].getAsFile();
          break;
        }
      }
    } else {
      file = ev.dataTransfer.files[0];
    }
    if (!file || !file.type.startsWith("image")) {return}
    const name = file.name.replace(/\.[^/.]+$/, "");
    dispatch(async (dispatch) => {
      await dispatch(createLayer(renderOrder.length, false, { name }));
      dispatch(setImportImageFile(file));
    });
  };

  return (
    <WorkspaceSC
      ref={workspaceRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      cursor={getCursor(isDragging ? "activeHand" : activeTool, keys)}
    >
      <DropZone onDrop={handleDrop} />
      <CanvasPaneSC
        translateX={translateX}
        translateY={translateY}
        width={documentWidth}
        height={documentHeight}
        workspaceWidth={workspaceDimensions.w}
        workspaceHeight={workspaceDimensions.h}
        zoomPct={zoomPct}
      >
        <MainCanvas />
      </CanvasPaneSC>
      {importImageFile && (
        <TransformObject
          source={importImageFile}
          target={renderOrder[renderOrder.length - 1]}
          targetCtx={layerCanvas[renderOrder[renderOrder.length - 1]].getContext("2d")}
        />
      )}
      {transformTarget && (
        <TransformObject
          source={layerCanvas.placeholder}
          target={transformTarget}
          targetCtx={layerCanvas[transformTarget].getContext("2d")}
          targetOffset={layerSettings[transformTarget].offset}
          docSize={{ w: documentWidth, h: documentHeight }}
        />
      )}
      {cropIsActive && (
        <CropObject />
      )}
      <ZoomDisplaySC>Zoom: {Math.ceil(zoomPct * 100) / 100}%</ZoomDisplaySC>
      <NameDisplaySC>{documentName}</NameDisplaySC>
    </WorkspaceSC>
  );
}
