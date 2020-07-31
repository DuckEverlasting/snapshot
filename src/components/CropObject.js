import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import useEventListener from "../hooks/useEventListener";
import { setMenuIsDisabled, setCropIsActive } from "../actions/redux";
import transformActionFactory from "../utils/TransformAction";
import { calculateClipping } from "../utils/helpers";

import styled from "styled-components";
import { resizeDocument } from "../actions/redux/menuAction";

const BoundingBoxSC = styled.div.attrs((props) => ({
  style: {
    cursor: props.overrideCursor || "auto",
  },
}))`
  position: absolute;
  width: 100%;
  height: 100%;
`;

const ContainerSC = styled.div.attrs((props) => ({
  style: {
    transform: `translateX(${props.offset.x}px)
                translateY(${props.offset.y}px)`,
    width: props.size ? (Math.floor(props.size.w * props.zoom)) + "px" : "auto",
    height: props.size ? (Math.floor(props.size.h * props.zoom)) + "px" : "auto",
    cursor: props.overrideCursor || "move",
    border: props.borderStyle || "2px solid " + props.theme.colors.highlight,
  },
}))`
  flex-grow: 0;
  flex-shrink: 0;
  position: relative;
  box-sizing: content-box;
`;

const ClipCheckSC = styled.div.attrs((props) => ({
  style: {
    clipPath: `inset(${props.clip.up}px ${props.clip.right}px ${props.clip.down}px ${props.clip.left}px)`
  }
}))`
  position: absolute;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
  width: 100%;
  height: 100%;
`;

const ResizeSideSC = styled.div`
  position: absolute;
`;

const ResizeCornerSC = styled.div`
  position: absolute;
  border: 1px solid black;
  background: white;
`;

const NResizeSC = styled(ResizeSideSC)`
  top: -7.5px;
  left: 7.5px;
  width: calc(100% - 15px);
  height: 15px;
  cursor: n-resize;
`;

const SResizeSC = styled(ResizeSideSC)`
  bottom: -7.5px;
  left: 7.5px;
  width: calc(100% - 15px);
  height: 15px;
  cursor: s-resize;
`;

const EResizeSC = styled(ResizeSideSC)`
  bottom: 7.5px;
  left: calc(100% - 7.5px);
  width: 15px;
  height: calc(100% - 15px);
  cursor: e-resize;
`;

const WResizeSC = styled(ResizeSideSC)`
  bottom: 7.5px;
  left: -7.5px;
  width: 15px;
  height: calc(100% - 15px);
  cursor: w-resize;
`;

const NEResizeSC = styled(ResizeCornerSC)`
  top: -7.5px;
  left: calc(100% - 7.5px);
  width: 15px;
  height: 15px;
  cursor: ne-resize;
`;

const SEResizeSC = styled(ResizeCornerSC)`
  bottom: -7.5px;
  left: calc(100% - 7.5px);
  width: 15px;
  height: 15px;
  cursor: se-resize;
`;

const SWResizeSC = styled(ResizeCornerSC)`
  bottom: -7.5px;
  left: -7.5px;
  width: 15px;
  height: 15px;
  cursor: sw-resize;
`;

const NWResizeSC = styled(ResizeCornerSC)`
  top: -7.5px;
  left: -7.5px;
  width: 15px;
  height: 15px;
  cursor: nw-resize;
`;

let currentTransformAction = null;

export default function CropObject() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ w: 0, h: 0 });

  const { workspaceOffset, zoom } = useSelector((state) => {
    let settings = state.ui.workspaceSettings;
    return {
      workspaceOffset: { x: settings.translateX, y: settings.translateY },
      zoom: settings.zoomPct / 100,
    };
  });
  const { documentWidth, documentHeight } = useSelector(state => state.main.present.documentSettings);
  const activeLayer = useSelector(state => state.main.present.activeLayer);
  const activeTool = useSelector(state => state.ui.activeTool);
  const startDimensions = useSelector(state => state.ui.cropParams.startDimensions);
  const [initLayer, ] = useState(activeLayer);
  const [initialized, setInitialized] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setMenuIsDisabled(true));
    setInitialized(true);
    return () => dispatch(setMenuIsDisabled(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setOffset({
      x: startDimensions ? startDimensions.x : 0,
      y: startDimensions ? startDimensions.y : 0,
    });
    setSize({
      w: startDimensions ? startDimensions.w : documentWidth,
      h: startDimensions ? startDimensions.h : documentHeight,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDimensions]);

  function handleMouseDown(ev, actionType) {
    if (ev.button !== 0) return;
    ev.stopPropagation && ev.stopPropagation();
    if (!actionType) return;
    currentTransformAction = transformActionFactory(
      ev,
      { 
        size,
        setSize,
        offset,
        setOffset,
        zoom
      },
      { actionType, invertShiftOnResize: true }
    );
    currentTransformAction.start(ev);
  }

  function handleMouseMove(ev) {
    if (!currentTransformAction) {
      return;
    }
    currentTransformAction.move(ev);
  }

  function handleMouseUp() {
    currentTransformAction = null;
  }

  function calculateOffset() {
    return {
      x: Math.floor(workspaceOffset.x + offset.x * zoom),
      y: Math.floor(workspaceOffset.y + offset.y * zoom),
    };
  }

  function cancel() {
    dispatch(setCropIsActive(false));
  }

  function apply() {
    dispatch(resizeDocument(size.w, size.h, offset));
    return dispatch(setCropIsActive(false));
  }

  useEffect(() => {
    if (!initialized) return;
    if (activeTool !== "crop" || activeLayer !== initLayer) {
      apply();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTool, activeLayer, initLayer, initialized]);

  const handleKeyDown = useCallback(
    (ev) => {
      ev.preventDefault();
      if (ev.key === "Escape") {
        cancel();
      } else if (ev.key === "Enter") {
        apply();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, offset, size, documentHeight, documentWidth]
  );

  useEventListener("keydown", handleKeyDown);

  return (
    <BoundingBoxSC
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onKeyDown={handleKeyDown}
      onDragOver={(ev) => ev.preventDefault()}
      onDrop={(ev) => ev.preventDefault()}
      overrideCursor={
        currentTransformAction ? currentTransformAction.actionType : null
      }
    >
      <ContainerSC
        offset={calculateOffset()}
        size={size}
        zoom={zoom}
        onMouseDown={(ev) => handleMouseDown(ev, "move")}
        overrideCursor={
          currentTransformAction ? currentTransformAction.actionType : null
        }
      >
        <ClipCheckSC
          clip={calculateClipping(size, offset, {w: documentWidth, h: documentHeight}, zoom)}
        >
          {/* PUT DARK RECT WITH CLIPPING HERE? */}
        </ClipCheckSC>
        <>
          <NResizeSC
            onMouseDown={(ev) => handleMouseDown(ev, "n-resize")}
          />
          <SResizeSC
            onMouseDown={(ev) => handleMouseDown(ev, "s-resize")}
          />
          <EResizeSC
            onMouseDown={(ev) => handleMouseDown(ev, "e-resize")}
          />
          <WResizeSC
            onMouseDown={(ev) => handleMouseDown(ev, "w-resize")}
          />
          <NEResizeSC
            onMouseDown={(ev) => handleMouseDown(ev, "ne-resize")}
          />
          <SEResizeSC
            onMouseDown={(ev) => handleMouseDown(ev, "se-resize")}
          />
          <SWResizeSC
            onMouseDown={(ev) => handleMouseDown(ev, "sw-resize")}
          />
          <NWResizeSC
            onMouseDown={(ev) => handleMouseDown(ev, "nw-resize")}
          />
        </>
      </ContainerSC>
    </BoundingBoxSC>
  );
}
