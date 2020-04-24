import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from "react-redux";
import styled from 'styled-components';

const BoundingBoxSC = styled.div.attrs(props => ({
  style: {
    cursor: props.overrideCursor || "auto"
  }
}))`
  position: absolute;
  width: 100%;
  height: 100%;
`;

const ContainerSC = styled.div.attrs(props => ({
  style: {
    transform: `translateX(${props.offset.x}px)
                translateY(${props.offset.y}px)`,
    width: props.size ? (props.size.w * props.zoom) + "px" : "auto",
    height: props.size ? (props.size.h * props.zoom) + "px": "auto",
    cursor: props.overrideCursor || "move"
  }
}))`
  position: relative;
  border: 2px solid black;
`;

const NResizeSC = styled.div`
  position: absolute;
  top: -7.5px;
  left: 7.5px;
  width: calc(100% - 15px);
  height: 15px;
  cursor: n-resize;
`;

const SResizeSC = styled.div`
  position: absolute;
  bottom: -7.5px;
  left: 7.5px;
  width: calc(100% - 15px);
  height: 15px;
  cursor: s-resize;
`;

const EResizeSC = styled.div`
  position: absolute;
  bottom: 7.5px;
  left: calc(100% - 7.5px);
  width: 15px;
  height: calc(100% - 15px);
  cursor: e-resize;
`;

const WResizeSC = styled.div`
  position: absolute;
  bottom: 7.5px;
  left: -7.5px;
  width: 15px;
  height: calc(100% - 15px);
  cursor: w-resize;
`;

const NEResizeSC = styled.div`
  position: absolute;
  top: -7.5px;
  left: calc(100% - 7.5px);
  width: 15px;
  height: 15px;
  cursor: ne-resize;
`;

const SEResizeSC = styled.div`
  position: absolute;
  bottom: -7.5px;
  left: calc(100% - 7.5px);
  width: 15px;
  height: 15px;
  cursor: se-resize;
`;

const SWResizeSC = styled.div`
  position: absolute;
  bottom: -7.5px;
  left: -7.5px;
  width: 15px;
  height: 15px;
  cursor: sw-resize;
`;

const NWResizeSC = styled.div`
  position: absolute;
  top: -7.5px;
  left: -7.5px;
  width: 15px;
  height: 15px;
  cursor: nw-resize;
`;

export default function TransformObject({initImage}) {
  const [currentAction, setCurrentAction] = useState("");
  const [dragOrigin, setDragOrigin] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ h: 0, w: 0 });
  const [boundingDimensions, setBoundingDimensions] = useState({});

  const { workspaceOffset, zoom } = useSelector(state => {
    let settings = state.ui.workspaceSettings;
    return {
      workspaceOffset: {x: settings.translateX, y: settings.translateY},
      zoom: settings.zoomPct / 100
    }
  });

  const boundingBoxRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    let initWidth, initHeight;
    if (!initImage) {
      initWidth = 1300;
      initHeight = 730;
    } else {
      initWidth = initImage.width;
      initHeight = initImage.height;
    }

    setBoundingDimensions({
      x: boundingBoxRef.current.clientWidth,
      y: boundingBoxRef.current.clientHeight,
    });
    setSize({
      w: initWidth,
      h: initHeight
    });
    setOffset({
      x: boundingBoxRef.current.clientWidth / 2 - initWidth / 2,
      y: boundingBoxRef.current.clientHeight / 2 - initHeight / 2
    });
    canvasRef.current.width = initWidth;
    canvasRef.current.height = initHeight;
    if (initImage) {
      canvasRef.current.getContext('2d').drawImage(initImage, 0, 0);
    }
  }, [initImage]);

  function handleMouseDown(ev, actionType) {
    if (ev.button !== 0) return;
    ev.stopPropagation();
    setCurrentAction(actionType);
    setDragOrigin({
      x: ev.screenX,
      y: ev.screenY,
      w: size.w,
      h: size.h,
      offX: offset.x,
      offY: offset.y,
    });
  }

  function handleMouseMove(ev) {
    if (!currentAction) return;
    if (currentAction.endsWith("resize")) {
      handleResizeUpdate(ev);
    } else if (currentAction === "move") {
      handleMoveUpdate(ev);
    } else if (currentAction === "rotate") {
      handleRotateUpdate(ev);
    }
  }

  function handleResizeUpdate(ev) {
    let calculatedWidth = size.w;
    let calculatedHeight = size.h;
    let calculatedOffsetX = offset.x;
    let calculatedOffsetY = offset.y;

    if (currentAction.slice(0, 2).includes("n")) {
      calculatedHeight = dragOrigin.h - (ev.screenY - dragOrigin.y);
      calculatedOffsetY = dragOrigin.offY + (ev.screenY - dragOrigin.y);
    }
    if (currentAction.slice(0, 2).includes("s")) {
      calculatedHeight = dragOrigin.h + (ev.screenY - dragOrigin.y);
    }
    if (currentAction.slice(0, 2).includes("e")) {
      calculatedWidth = dragOrigin.w + (ev.screenX - dragOrigin.x);
    }
    if (currentAction.slice(0, 2).includes("w")) {
      calculatedWidth = dragOrigin.w - (ev.screenX - dragOrigin.x);
      calculatedOffsetX = dragOrigin.offX + (ev.screenX - dragOrigin.x);
    }

    setOffset({
      x: calculatedOffsetX,
      y: calculatedOffsetY
    });
    setSize({
      w: calculatedWidth,
      h: calculatedHeight
    });
  }

  function handleMoveUpdate(ev) {
    const x = ev.screenX - (dragOrigin.x - dragOrigin.offX);
    const y = ev.screenY - (dragOrigin.y - dragOrigin.offY);
   
    setOffset({x, y});
  }

  function handleRotateUpdate(ev) {

  }

  function handleMouseUp() {
    if (dragOrigin) {
      let moved = offset.x - dragOrigin.offX
      console.log("x moved " + moved)
    }
    setCurrentAction("")
  }

  function calculateOffset() {
    if (!boundingBoxRef.current) return ({x: 0, y: 0})
    const totalOffsetX = offset.x + workspaceOffset.x
    const totalOffsetY = offset.y + workspaceOffset.y
    
    return {
      x: totalOffsetX + .5 * size.w * (1 - zoom),
      y: totalOffsetY + .5 * size.h * (1 - zoom)
    }
  }

  return (
    <BoundingBoxSC
      ref={boundingBoxRef}
      onMouseDown={ev => handleMouseDown(ev, "rotate")}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      overrideCursor={currentAction}
    >
      <ContainerSC
        offset={calculateOffset()}
        size={size}
        zoom={zoom}
        onMouseDown={ev => handleMouseDown(ev, "move")}
        overrideCursor={currentAction}
      >
        <canvas ref={canvasRef}/>
        <NResizeSC
          onMouseDown={ev => handleMouseDown(ev, "n-resize")}
        />
        <SResizeSC
          onMouseDown={ev => handleMouseDown(ev, "s-resize")}
        />
        <EResizeSC
          onMouseDown={ev => handleMouseDown(ev, "e-resize")}
        />
        <WResizeSC
          onMouseDown={ev => handleMouseDown(ev, "w-resize")}
        />
        <NEResizeSC
          onMouseDown={ev => handleMouseDown(ev, "ne-resize")}
        />
        <SEResizeSC
          onMouseDown={ev => handleMouseDown(ev, "se-resize")}
        />
        <SWResizeSC
          onMouseDown={ev => handleMouseDown(ev, "sw-resize")}
        />
        <NWResizeSC
          onMouseDown={ev => handleMouseDown(ev, "nw-resize")}
        />
      </ContainerSC>
    </BoundingBoxSC>
  )
}