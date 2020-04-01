import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";

import styled from "styled-components";

import DrawSpace from "../components/DrawSpace";
import Layer from "../components/Layer";

import { getZoomAmount } from "../utils/helpers";

import { updateWorkspaceSettings } from "../actions/redux";

const WorkspaceSC = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  border: 1px solid black;
  overflow: hidden;
  z-index: 1;
  background: rgb(175, 175, 175);
`;

const ZoomDisplaySC = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  color: rgb(235, 235, 235);
  padding: 10px 20px;
  border-bottom-left-radius: 3px;
  z-index: 2;
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

export default function Workspace() {
  const { translateX, translateY, zoomPct } = useSelector(
    state => state.ui.workspaceSettings
  );
  const { canvasWidth, canvasHeight } = useSelector(
    state => state.main.present.documentSettings
  );
  const layerData = useSelector(state => state.main.present.layerData);
  const layerSettings = useSelector(state => state.main.present.layerSettings);
  const layerOrder = useSelector(state => state.main.present.layerOrder);
  const stagingPinnedTo = useSelector(
    state => state.main.present.stagingPinnedTo
  );

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
    const zoom = steps => {
      dispatch(
        updateWorkspaceSettings({ zoomPct: getZoomAmount(steps, zoomPct) })
      );
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
        let steps;
        if (ev.deltaY < 0) {
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

    return () => {
      workspaceElement.removeEventListener("wheel", mouseWheelHandler);
    };
  }, [dispatch, translateX, translateY, zoomPct]);

  const handleMouseDown = ev => {
    if (ev.button !== 2) return;
    setIsDragging(true);
    setDragOrigin({
      x: ev.screenX * (zoomPct / 100) - translateX,
      y: ev.screenY * (zoomPct / 100) - translateY
    });
  };

  const handleMouseUp = ev => {
    if (ev.button !== 2) return;
    setIsDragging(false);
    setDragOrigin({ x: null, y: null });
  };

  const handleMouseOut = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragOrigin({ x: null, y: null });
    }
  };

  const handleMouseMove = ev => {
    if (!isDragging) return;
    if (animationFrame === lastFrame) return;
    lastFrame = animationFrame;
    const deltaX = ev.screenX * (zoomPct / 100) - dragOrigin.x;
    const deltaY = ev.screenY * (zoomPct / 100) - dragOrigin.y;
    dispatch(
      updateWorkspaceSettings({
        translateX: deltaX,
        translateY: deltaY
      })
    );
  };

  return (
    <WorkspaceSC
      ref={workspaceRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseOut={handleMouseOut}
      onMouseMove={handleMouseMove}
    >
      <ZoomDisplaySC>Zoom: {Math.ceil(zoomPct * 100) / 100}%</ZoomDisplaySC>
      <CanvasPaneSC
        translateX={translateX}
        translateY={translateY}
        width={canvasWidth}
        height={canvasHeight}
        zoomPct={zoomPct}
      >
        {/* <DrawSpace
          overrideCursor={isDragging ? "grabbing" : null}
          index={layerOrder.length + 5}
        /> */}
        <LayerRenderer
          layerOrder={layerOrder}
          layerData={layerData}
          layerSettings={layerSettings}
          stagingPinnedTo={stagingPinnedTo}
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
  stagingPinnedTo,
  width,
  height
}) {
  return (
    <>
      <Layer
        id={"selection"}
        width={width}
        height={height}
        index={layerOrder.length + 4}
        data={layerData.selection}
        hidden={false}
        opacity={1}
      />
      {stagingPinnedTo === "selection" && (
        <Layer
          key={"staging"}
          id={"staging"}
          width={width}
          height={height}
          index={layerOrder.length + 4}
          data={layerData.staging}
          hidden={false}
          opacity={1}
        />
      )}
      {layerOrder.length !== 0 &&
        layerOrder.map((layerId, i) => {
          let layerDat = layerData[layerId];
          let layerSet = layerSettings[layerId];
          return stagingPinnedTo === layerId ? (
            <>
              <Layer
                key={layerId}
                id={layerId}
                width={width}
                height={height}
                index={i + 1}
                data={layerDat}
                hidden={layerSet.hidden}
                opacity={layerSet.opacity}
              />
              <Layer
                key={"staging"}
                id={"staging"}
                width={width}
                height={height}
                index={i + 1}
                data={layerData.staging}
                hidden={false}
                opacity={1}
              />
            </>
          ) : (
            <Layer
              key={layerId}
              id={layerId}
              width={width}
              height={height}
              index={i + 1}
              data={layerDat}
              hidden={layerSet.hidden}
              opacity={layerSet.opacity}
            />
          );
        })}
      <Layer
        id={"clipboard"}
        width={width}
        height={height}
        index={1}
        data={layerData.clipboard}
        hidden={true}
        opacity={1}
      />
    </>
  );
}
