import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from "react-redux";
import useEventListener from "../hooks/useEventListener";
import menuAction from "../actions/redux/menuAction";
import manipulate from "../reducers/custom/manipulateReducer";
import { setImportImageFile } from "../actions/redux/index";

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
    width: props.size ? props.size.w * props.zoom + "px" : "auto",
    height: props.size ? props.size.h * props.zoom + "px": "auto",
    cursor: props.overrideCursor || "move",
    border: "1px solid #ffe312"
  }
}))`
  flex-grow: 0;
  flex-shrink: 0;
  position: relative;
  box-sizing: content-box;
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
  border: 1px solid black;
  background: white;
`;

const SEResizeSC = styled.div`
  position: absolute;
  bottom: -7.5px;
  left: calc(100% - 7.5px);
  width: 15px;
  height: 15px;
  cursor: se-resize;
  border: 1px solid black;
  background: white;

`;

const SWResizeSC = styled.div`
  position: absolute;
  bottom: -7.5px;
  left: -7.5px;
  width: 15px;
  height: 15px;
  cursor: sw-resize;
  border: 1px solid black;
  background: white;

`;

const NWResizeSC = styled.div`
  position: absolute;
  top: -7.5px;
  left: -7.5px;
  width: 15px;
  height: 15px;
  cursor: nw-resize;
  border: 1px solid black;
  background: white;

`;

const CanvasSC = styled.canvas.attrs(props => ({
  style: {
    clipPath: `inset(${props.clip.up}px ${props.clip.right}px ${props.clip.down}px ${props.clip.left}px)`
  }
}))`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`

export default function TransformObject() {
  const [currentAction, setCurrentAction] = useState("");
  const [dragOrigin, setDragOrigin] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ h: 0, w: 0 });
  const [image, setImage] = useState(null);
  const [transformCanvasSize, setTransformCanvasSize] = useState({ x: 0, y: 0 });

  const imageFile = useSelector(state => state.ui.importImageFile);
  const { workspaceOffset, zoom } = useSelector(state => {
    let settings = state.ui.workspaceSettings;
    return {
      workspaceOffset: { x: settings.translateX, y: settings.translateY },
      zoom: settings.zoomPct / 100
    }
  });
  const targetCtx = useSelector(state => {
    return state.main.present.layerData[
      state.main.present.layerOrder[state.main.present.layerOrder.length - 1]
    ].getContext("2d");
  });
  const { documentWidth, documentHeight } = useSelector(state => state.main.present.documentSettings);

  const dispatch = useDispatch();

  const canvasRef = useRef();
  const boundingBoxRef = useRef();

  useEffect(() => {
    // canvasRef.current.getContext('2d').imageSmoothingEnabled = false;
    const image = new Image();
    image.src = URL.createObjectURL(imageFile);
    image.onload = () => {
      setImage(image);
      let initWidth = image.width;
      let initHeight = image.height;
      setOffset({
        x: 0,
        y: 0
      });
      setSize({
        w: initWidth,
        h: initHeight
      });
      setTransformCanvasSize({
        w: initWidth,
        h: initHeight
      });
    }
  }, [imageFile]);

  useEffect(() => {
    if (!image) return;
    canvasRef.current.getContext('2d').drawImage(image, 0, 0);
  }, [transformCanvasSize]);

  function handleMouseDown(ev, actionType) {
    if (ev.button !== 0) return;
    ev.stopPropagation();
    setCurrentAction(actionType);
    console.log({
      x: ev.screenX,
      y: ev.screenY,
      w: size.w,
      h: size.h,
      offX: offset.x,
      offY: offset.y,
    })
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
    let x, y, calculatedWidth, calculatedHeight, calculatedOffsetX, calculatedOffsetY;
    calculatedWidth = size.w;
    calculatedHeight = size.h;
    calculatedOffsetX = offset.x;
    calculatedOffsetY = offset.y;
    x = ev.screenX;
    y = ev.screenY;

    if (!ev.shiftKey && !currentAction.slice(0, 2).includes("-")) {
      const distX = x - dragOrigin.x;
      const distY = y - dragOrigin.y;
      let dist;
      if (currentAction === "se-resize") {
        dist = Math.min(-distX, -distY);
        x = dragOrigin.x - dist;
        y = dragOrigin.y - dist;
      } else if (currentAction === "nw-resize") {
        dist = Math.min(distX, distY);
        x = dragOrigin.x + dist;
        y = dragOrigin.y + dist;
      } else if (currentAction === "sw-resize") {
        dist = Math.min(distX, -distY);
        x = dragOrigin.x + dist;
        y = dragOrigin.y - dist;
      } else if (currentAction === "ne-resize") {
        dist = Math.min(-distX, distY);
        x = dragOrigin.x - dist;
        y = dragOrigin.y + dist;
      }
    }

    if (currentAction.slice(0, 2).includes("n")) {
      calculatedHeight = dragOrigin.h - (y - dragOrigin.y) / zoom;
      if (calculatedHeight > 1) {
        calculatedOffsetY = dragOrigin.offY + .5 * (y - dragOrigin.y) / zoom;
      }
    }
    if (currentAction.slice(0, 2).includes("s")) {
      calculatedHeight = dragOrigin.h + (y - dragOrigin.y) / zoom;
      if (calculatedHeight > 1) {
        calculatedOffsetY = dragOrigin.offY + .5 * (y - dragOrigin.y) / zoom;
      }
    }
    if (currentAction.slice(0, 2).includes("e")) {
      calculatedWidth = dragOrigin.w + (x - dragOrigin.x) / zoom;
      if (calculatedWidth > 1) {
        calculatedOffsetX = dragOrigin.offX + .5 * (x - dragOrigin.x) / zoom;
      }
    }
    if (currentAction.slice(0, 2).includes("w")) {
      calculatedWidth = dragOrigin.w - (x - dragOrigin.x) / zoom;
      if (calculatedWidth > 1) {
        calculatedOffsetX = dragOrigin.offX + .5 * (x - dragOrigin.x) / zoom;
      }
    }

    setOffset({
      x: calculatedOffsetX,
      y: calculatedOffsetY
    });
    setSize({
      w: Math.max(calculatedWidth, 1),
      h: Math.max(calculatedHeight, 1)
    });
  }

  function handleMoveUpdate(ev) {
    const x = (ev.screenX - (dragOrigin.x - dragOrigin.offX * zoom)) / zoom;
    const y = (ev.screenY - (dragOrigin.y - dragOrigin.offY * zoom)) / zoom;
   
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
    if (!boundingBoxRef.current) {return {x: 0, y: 0}}
    const xFromCenter = (boundingBoxRef.current.clientWidth - size.w * zoom) / 2;
    const yFromCenter = (boundingBoxRef.current.clientHeight - size.h * zoom) / 2;
    return {
      x: xFromCenter + workspaceOffset.x + offset.x * zoom,
      y: yFromCenter + workspaceOffset.y + offset.y * zoom
    }
  }

  function calculateClipping() {
    return {
      up: ((.5 * size.h - offset.y) - .5 * documentHeight) * zoom,
      down: ((.5 * size.h + offset.y) - .5 * documentHeight) * zoom,
      left: ((.5 * size.w - offset.x) - .5 * documentWidth) * zoom,
      right: ((.5 * size.w + offset.x) - .5 * documentWidth) * zoom
    }
  }

  const handleKeyDown = useCallback(ev => {
    if (ev.key === "Escape") {
      dispatch(menuAction("undo"))
      dispatch(setImportImageFile(null))
    } else if (ev.key === "Enter") {
      manipulate(targetCtx, {
        action: "paste",
        params: {
          sourceCtx: canvasRef.current.getContext("2d"),
          dest: {
            x: Math.ceil(offset.x - .5 * size.w + .5 * documentWidth),
            y: Math.ceil(offset.y - .5 * size.h + .5 * documentHeight)
          },
          size
        }
      })
      dispatch(setImportImageFile(null))
    }
  }, [dispatch, offset, size, documentHeight, documentWidth])

  useEventListener("keydown", handleKeyDown);

  return (
    <BoundingBoxSC
        onMouseDown={ev => handleMouseDown(ev, "rotate")}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onKeyDown={handleKeyDown}
        onDragOver={ev => ev.preventDefault()}
        onDrop={ev => ev.preventDefault()}
        overrideCursor={currentAction}
        ref={boundingBoxRef}
      >
        <ContainerSC
          offset={calculateOffset()}
          size={size}
          zoom={zoom}
          onMouseDown={ev => handleMouseDown(ev, "move")}
          overrideCursor={currentAction}
        >
          <CanvasSC width={transformCanvasSize.w} height={transformCanvasSize.h} clip={calculateClipping()} ref={canvasRef}/>
          <NResizeSC
            zoom={zoom}
            onMouseDown={ev => handleMouseDown(ev, "n-resize")}
          />
          <SResizeSC
            zoom={zoom}
            onMouseDown={ev => handleMouseDown(ev, "s-resize")}
          />
          <EResizeSC
            zoom={zoom}
            onMouseDown={ev => handleMouseDown(ev, "e-resize")}
          />
          <WResizeSC
            zoom={zoom}
            onMouseDown={ev => handleMouseDown(ev, "w-resize")}
          />
          <NEResizeSC
            zoom={zoom}
            onMouseDown={ev => handleMouseDown(ev, "ne-resize")}
          />
          <SEResizeSC
            zoom={zoom}
            onMouseDown={ev => handleMouseDown(ev, "se-resize")}
          />
          <SWResizeSC
            zoom={zoom}
            onMouseDown={ev => handleMouseDown(ev, "sw-resize")}
          />
          <NWResizeSC
            zoom={zoom}
            onMouseDown={ev => handleMouseDown(ev, "nw-resize")}
          />
        </ContainerSC>
      </BoundingBoxSC>
  )
}