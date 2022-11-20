import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";

import styled from "styled-components";

import TransformObject from "../components/TransformObject";
import CropObject from "../components/CropObject";
import PixelGrid from "../components/PixelGrid";

import { ZOOM_MIN, ZOOM_MAX } from "../constants/constants";


import { getZoomAmount } from "../utils/helpers";

import getCursor from "../utils/cursors";

import createToolAction from "../store/actions/redux/createToolAction";

import {
  updateWorkspaceSettings,
  setImportImageFile,
  createLayer
} from "../store/actions/redux";

import DropZone from "../components/DropZone";
import useEventListener from "../hooks/useEventListener";

import MainCanvas from "../components/MainCanvas";
import render from "../store/actions/redux/renderCanvas";
import useUpdateOnResize from "../hooks/useUpdateOnResize";
import selectFromActiveProject from "../utils/selectFromActiveProject";
import NumberInput from "../components/NumberInput";

const WorkspaceSC = styled.div`
  position: relative;
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
  width: 150px;
  background: rgba(0, 0, 0, 0.5);
  color: rgb(235, 235, 235);
  padding: 10px 20px;
  border-bottom-left-radius: 3px;
  pointer-events: all;
`;

let animationFrame = 0;
let lastFrame = 0;

export default function Workspace() {
  const { translateX, translateY, zoomPct } = useSelector(
    (state) => state.ui.workspaceSettings
  );
  
  const { dpi, activeTool, transformTarget, cropIsActive } = useSelector((state) => state.ui);
  const activeProject = useSelector(state => state.main.activeProject);
  const { documentWidth, documentHeight } = useSelector((state) => state.main.projects[activeProject].present.documentSettings);
  const [layerCanvas, layerSettings, renderOrder] = useSelector(
    selectFromActiveProject("layerCanvas", "layerSettings", "renderOrder")
  );
  const { modKeys } = useSelector((state) => state.ui);
  const currentToolAction = useSelector((state) => state.main.currentToolAction);
  
  const utilityCanvas = useSelector((state) => state.main.utilityCanvas);
  const importImageFile = useSelector((state) => state.ui.importImageFile);

  const [isDragging, setIsDragging] = useState(false);
  const [dragOrigin, setDragOrigin] = useState({ x: null, y: null });
  const [cursorState, setCursorState] = useState({ button: null, buttons: 0 });

  const workspaceRef = useRef(null);

  const workspaceDimensions = useUpdateOnResize(workspaceRef);

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
    dispatch(async (dispatch) => {
      await dispatch(updateWorkspaceSettings({
        translateX: 0.5 * (workspaceRef.current.clientWidth - documentWidth * zoomPct / 100),
        translateY: 0.5 * (workspaceRef.current.clientHeight - documentHeight * zoomPct / 100),
      }));
      dispatch(render({ clearAll: true }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentWidth, documentHeight]);

  function capTranslate(translateX, translateY, zoom = zoomPct) {
    const zoomDocWidth = documentWidth * (zoom / 100),
      zoomDocHeight = documentHeight * (zoom / 100),
      maxX = zoomDocWidth + (workspaceDimensions.w - zoomDocWidth) - 50,
      minX = -zoomDocWidth + 50,
      maxY = zoomDocHeight + (workspaceDimensions.h - zoomDocHeight) - 50,
      minY = -zoomDocHeight + 50;
    return [
      Math.max(minX, Math.min(maxX, translateX)),
      Math.max(minY, Math.min(maxY, translateY))
    ]
  }

  const directZoom = (pct) => {
    dispatch(async (dispatch) => {
      await dispatch(updateWorkspaceSettings({
        zoomPct: pct
      }));
      dispatch(render({ clearAll: true }));
    });
  }

  const zoom = (steps, e) => {
    const newZoomPct = getZoomAmount(steps, zoomPct),
      toLeft = e.nativeEvent ? e.nativeEvent.offsetX : e.offsetX,
      toTop = e.nativeEvent ? e.nativeEvent.offsetY : e.offsetY,
      zoomFraction = (newZoomPct / 100) / (zoomPct / 100);

    let transX, transY;

    if (
      workspaceRef.current.clientHeight - documentHeight * newZoomPct / 100 > 0 &&
      workspaceRef.current.clientWidth - documentWidth * newZoomPct / 100 > 0 &&
      newZoomPct < zoomPct
    ) {
      transY = 0.5 * (workspaceRef.current.clientHeight - documentHeight * newZoomPct / 100)
      transX = 0.5 * (workspaceRef.current.clientWidth - documentWidth * newZoomPct / 100)
    } else {
      transX = zoomFraction * (translateX - toLeft) + toLeft;
      transY = zoomFraction * (translateY - toTop) + toTop;  
    }

    const [newTranslateX, newTranslateY] = capTranslate(transX, transY, newZoomPct);

    dispatch(async (dispatch) => {
      await dispatch(updateWorkspaceSettings({
        translateX: newTranslateX,
        translateY: newTranslateY,
        zoomPct: newZoomPct
      }));
      dispatch(render({ clearAll: true }));
    });
  };

  const zoomTool = (e, zoomOut) => {
    let steps;
    if (!zoomOut) {
      steps = e.shiftKey ? 2 : 1;
      zoom(steps, e);
    } else {
      steps = e.shiftKey ? -2 : -1;
      zoom(steps, e);
    }
    dispatch(render({ clearAll: true }));
  };

  const translate = (deltaX, deltaY) => {
    const [newTranslateX, newTranslateY] = capTranslate(translateX + deltaX, translateY + deltaY);
    dispatch(async (dispatch) => {
      await dispatch(updateWorkspaceSettings({
        translateX: newTranslateX,
        translateY: newTranslateY,
      }));
      dispatch(render({ clearAll: true }));
    });
  };

  const translateTool = (e) => {
    const str = e.shiftKey ? 3 : 1;
    let dir;
    let modifier = window.navigator.platform.includes("Mac")
      ? e.metaKey
      : e.ctrlKey;
    if (e.deltaX && e.deltaY) {
      // FIGURE THIS OUT LATER(?)
      return;
    } else if (e.deltaX) {
      dir = e.deltaX > 0 ? -1 : 1;
      if (modifier) {
        translate(0, 10 * dir * str);
      } else {
        translate(10 * dir * str, 0);
      }
    } else if (e.deltaY) {
      dir = e.deltaY > 0 ? -1 : 1;
      if (modifier) {
        translate(10 * dir * str, 0);
      } else {
        translate(0, 10 * dir * str);
      }
    }
  };

  const handleMouseWheel = useCallback((e) => {
      e.preventDefault();
      if (e.buttons !== 0) {return}
      if (e.altKey) {
        zoomTool(e, e.deltaY > 0);
      } else {
        translateTool(e);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [translateX, translateY, zoomPct]);

  useEventListener("wheel", handleMouseWheel, workspaceElement);

  const handleMouseDown = (e) => {
    setCursorState({ button: e.button, buttons: e.buttons });
    if (e.buttons === 4 || activeTool === "hand") {
      setIsDragging(true);
      setDragOrigin({
        x: ((Math.floor(e.screenX) - translateX) * 100) / zoomPct,
        y: ((Math.floor(e.screenY) - translateY) * 100) / zoomPct,
      });
    } else if (e.buttons === 1) {
      dispatch(createToolAction(e));
      // if (eventIsWithinCanvas(e)) {
      //   isDrawing = true;
      // }
    }
  };

  const handleMouseLeave = (e) => {
    setCursorState({ button: null, buttons: 0 });
    if (currentToolAction && e.buttons === 1) {
      // if (isDrawing) {
      //   currentToolAction.end();
      //   isDrawing = false;
      // }
      currentToolAction.end();
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      if (animationFrame === lastFrame) return;
      lastFrame = animationFrame;
      const transX =
        Math.floor(e.screenX) - dragOrigin.x * (zoomPct / 100);
      const transY =
        Math.floor(e.screenY) - dragOrigin.y * (zoomPct / 100);
      const [newTranslateX, newTranslateY] = capTranslate(transX, transY);
      dispatch(async (dispatch) => {
        await dispatch(updateWorkspaceSettings({
          translateX: newTranslateX,
          translateY: newTranslateY,
        }));
        dispatch(render({ clearAll: true }));
      });
    } else if (currentToolAction && e.buttons === 1) {
      currentToolAction.move(e);
      // if (!isDrawing && eventIsWithinCanvas(e)) {
      //   isDrawing = true;
      // }
    }
  };

  const handleMouseUp = (e) => {
    setCursorState({ button: e.button, buttons: e.buttons });
    if (e.button === 1 || (e.button === 0 && activeTool === "hand")) {
      setIsDragging(false);
      setDragOrigin({ x: null, y: null });
    } else if (e.button === 0 && activeTool === "zoom") {
      zoomTool(e, e.altKey);
    } else if (currentToolAction && e.button === 0) {
      // if (isDrawing || currentToolAction.alwaysFire) {
      //   currentToolAction.end();
      //   isDrawing = false;
      // }
      currentToolAction.end();
    }
  };

  const handleDrop = async (e) => {
    let file;
    if (e.dataTransfer.items) {
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        if (e.dataTransfer.items[i].kind === "file") {
          file = e.dataTransfer.items[i].getAsFile();
          break;
        }
      }
    } else {
      file = e.dataTransfer.files[0];
    }
    if (!file || !file.type.startsWith("image")) {return}
    const name = file.name.replace(/\.[^/.]+$/, "");
    dispatch(async (dispatch) => {
      await dispatch(createLayer(renderOrder.length, { name }));
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
      cursor={getCursor(isDragging ? "activeHand" : activeTool, modKeys, cursorState)}
    >
      <DropZone onDrop={handleDrop} />
      <MainCanvas dpi={dpi}/>
      {importImageFile && (
        <TransformObject
          source={importImageFile}
          target={renderOrder[renderOrder.length - 1]}
          targetCtx={layerCanvas[renderOrder[renderOrder.length - 1]].getContext("2d")}
        />
      )}
      {transformTarget && (
        <TransformObject
          source={utilityCanvas.placeholder}
          target={transformTarget}
          targetCtx={layerCanvas[transformTarget].getContext("2d")}
          targetOffset={layerSettings[transformTarget].offset}
          docSize={{ w: documentWidth, h: documentHeight }}
        />
      )}
      {cropIsActive && (
        <CropObject />
      )}
      <PixelGrid />
      <ZoomDisplaySC>
        Zoom: {Math.ceil(zoomPct * 100) / 100}%
        <NumberInput
          onChange={value => {
            directZoom(value)
          }}
          value={Math.ceil(zoomPct * 100) / 100}
          min={ZOOM_MIN}
          max={ZOOM_MAX}
        />
      </ZoomDisplaySC>
    </WorkspaceSC>
  );
}
