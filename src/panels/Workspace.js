import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";

import DrawSpace from "../components/DrawSpace";
import Layer from "../components/Layer";

import { hotkey, hotkeyCtrl } from "../enums/hotkeys";

import {
  createLayer,
  updateWorkspaceSettings,
  makeActiveTool,
  updateColor,
  updateSelectionPath,
  updateLayerQueue,
  undo,
  redo
} from "../actions/redux";

const WorkspaceSC = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  border: 3px solid black;
  overflow: hidden;
  z-index: 1;
  background: rgb(175, 175, 175);
`;

const CanvasPaneSC = styled.div.attrs(props => ({
  style: {
    width: props.width,
    height: props.height,
    transform: `translateX(${props.translateX}px) translateY(${
      props.translateY
    }px) scale(${props.zoomPct / 100})`
  }
}))`
  position: relative;
  margin: auto;
  background: white;
  flex: none;
`;

let animationFrame = 0;
let lastFrame = 0;

export default function Workspace() {
  const {
    canvasWidth,
    canvasHeight,
    translateX,
    translateY,
    zoomPct
  } = useSelector(state => state.workspaceSettings);
  const activeLayer = useSelector(state => state.activeLayer);
  const layerData = useSelector(state => state.layerData);
  const layerSettings = useSelector(state => state.layerSettings);
  const layerOrder = useSelector(state => state.layerOrder);
  const layerCounter = useSelector(state => state.layerCounter);
  const selectionPath = useSelector(state => state.selectionPath);
  const { primary, secondary } = useSelector(state => state.colorSettings);

  const [isDragging, setIsDragging] = useState(false);
  const [dragOrigin, setDragOrigin] = useState({ x: null, y: null });

  const workspaceRef = useRef(null);

  const dispatch = useDispatch();

  useEffect(() => {
    const reqFrame = requestAnimationFrame(updateAnimatedLayers);

    return () => cancelAnimationFrame(reqFrame);
  }, []);

  function updateAnimatedLayers() {
    const reqFrame = requestAnimationFrame(updateAnimatedLayers);
    animationFrame = reqFrame;
  }

  useEffect(() => {
    const zoom = amount => {
      dispatch(updateWorkspaceSettings({ zoomPct: zoomPct * amount }));
    };
    const translate = (deltaX, deltaY) => {
      dispatch(
        updateWorkspaceSettings({
          translateX: translateX + deltaX,
          translateY: translateY + deltaY
        })
      );
    };
    const mouseWheelHandler = async ev => {
      ev.preventDefault();
      if (ev.altKey) {
        let amount;
        if (ev.deltaY < 0) {
          amount = ev.shiftKey ? 3 / 2 : 10 / 9;
          zoom(amount);
          if (zoomPct * amount >= 100) {
            // HANDLE ZOOM IN STUFF
          }
        } else {
          amount = ev.shiftKey ? 2 / 3 : 9 / 10;
          zoom(amount);

          // Autocenter when zooming out
          if (zoomPct * amount <= 100) {
            dispatch(updateWorkspaceSettings({ translateX: 0, translateY: 0 }));
          }
        }
      } else {
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
    };

    let workspaceElement = workspaceRef.current;
    workspaceElement.addEventListener("wheel", mouseWheelHandler);
    window.addEventListener("keydown", handleKeyDown);

    return () =>
      workspaceElement.removeEventListener("wheel", mouseWheelHandler);
      window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, translateX, translateY, zoomPct]);

  const handleMouseDown = ev => {
    if (ev.button !== 1) return;
    setIsDragging(true);
    setDragOrigin({
      x: ev.nativeEvent.offsetX * (zoomPct / 100),
      y: ev.nativeEvent.offsetY * (zoomPct / 100)
    });
  };

  const handleMouseUp = ev => {
    if (ev.button !== 1) return;
    setIsDragging(false);
    setDragOrigin({ x: null, y: null });
  };

  const handleMouseOut = ev => {
    if (isDragging) {
      setIsDragging(false);
      setDragOrigin({ x: null, y: null });
    }
  };

  const handleMouseMove = ev => {
    if (!isDragging) return;
    if (animationFrame === lastFrame) return;
    lastFrame = animationFrame;
    const deltaX = dragOrigin.x - ev.nativeEvent.offsetX * (zoomPct / 100);
    const deltaY = dragOrigin.y - ev.nativeEvent.offsetY * (zoomPct / 100);
    dispatch(
      updateWorkspaceSettings({
        translateX: translateX - deltaX,
        translateY: translateY - deltaY
      })
    );
  };

  const handleKeyDown = ev => {
    ev.preventDefault();
    let keyCombo;
    let modifier = window.navigator.platform.includes("Mac")
      ? ev.metaKey
      : ev.ctrlKey;
    if (modifier) {
      keyCombo = hotkeyCtrl[ev.key];
    } else {
      keyCombo = hotkey[ev.key];
    }
    if (keyCombo === undefined) return;
    if (keyCombo.type === "activeTool") {
      dispatch(makeActiveTool(keyCombo.payload));
    } else {
      switch (keyCombo.payload) {
        case "switchColors":
          dispatch(updateColor("primary", secondary));
          dispatch(updateColor("secondary", primary));
          break;
        case "deselect":
          dispatch(
            updateLayerQueue("selection", { action: "clear", type: "draw", params: {selectionPath: null} })
          );
          dispatch(updateSelectionPath(null));
          break;
        case "duplicate":
          const sourceCtx = layerData[activeLayer].ctx;
          const newLayerId = layerCounter;
          dispatch(createLayer(activeLayer));
          dispatch(
            updateLayerQueue(newLayerId, {
              type: "manipulate",
              action: "paste",
              params: {
                sourceCtx,
                dest: [0, 0],
                clip: selectionPath
              }
            })
          );
          break;
        case "copy":
          dispatch(
            updateLayerQueue("clipboard", {
              type: "manipulate",
              action: "paste",
              params: {
                sourceCtx: layerData[activeLayer].ctx,
                dest: [0, 0],
                clip: selectionPath,
                clearFirst: true
              }
            })
          );
          break;
        case "paste":
          dispatch(
            updateLayerQueue(activeLayer, {
              type: "manipulate",
              action: "paste",
              params: {
                sourceCtx: layerData.clipboard.ctx,
                dest: [0, 0]
              }
            })
          );
          break;
        case "pasteToNew":
          const newLayerPasteId = layerCounter;
          dispatch(createLayer(activeLayer));
          dispatch(
            updateLayerQueue(newLayerPasteId, {
              type: "manipulate",
              action: "paste",
              params: {
                sourceCtx: layerData.clipboard.ctx,
                dest: [0, 0],
                clearFirst: true
              }
            })
          );
          break;
        case "undo":
          dispatch(undo());
          break;
        case "redo":
          dispatch(redo());
          break;
        default:
          break;
      }
    }
  };

  return (
    <WorkspaceSC ref={workspaceRef}>
      <CanvasPaneSC
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseOut={handleMouseOut}
        onMouseMove={handleMouseMove}
        translateX={translateX}
        translateY={translateY}
        width={canvasWidth}
        height={canvasHeight}
        zoomPct={zoomPct}
      >
        <DrawSpace
          overrideCursor={isDragging ? "grabbing" : null}
          index={layerOrder.length + 2}
        />
        <LayerRenderer
          layerOrder={layerOrder}
          layerData={layerData}
          layerSettings={layerSettings}
          width={canvasWidth}
          height={canvasHeight}
        />
      </CanvasPaneSC>
    </WorkspaceSC>
  );
}

function LayerRenderer({
  layerOrder,
  layerData,
  layerSettings,
  width,
  height
}) {
  // const [animationFrame, setAnimationFrame] = useState(0)

  // useEffect(() => {
  //   const reqFrame = requestAnimationFrame(updateAnimatedLayers);

  //   return () => cancelAnimationFrame(reqFrame);
  // }, [])

  // function updateAnimatedLayers() {
  //   const reqFrame = requestAnimationFrame(updateAnimatedLayers);
  //   setAnimationFrame(reqFrame)
  // }

  return (
    <>
      {layerOrder.length !== 0 &&
        layerOrder.map((layerId, i) => {
          let layerDat = layerData[layerId];
          let layerSet = layerSettings[layerId];
          return (
            <Layer
              key={layerId}
              id={layerId}
              // frame={animationFrame}
              width={width}
              height={height}
              index={i + 1}
              data={layerDat.data}
              hidden={layerSet.hidden}
              opacity={layerSet.opacity}
              queue={layerDat.queue}
            />
          );
        })}
    </>
  );
}
