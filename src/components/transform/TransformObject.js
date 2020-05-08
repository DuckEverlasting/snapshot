import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from "react-redux";
import useEventListener from "../../hooks/useEventListener";
import menuAction from "../../actions/redux/menuAction";
import manipulate from "../../reducers/custom/manipulateReducer";
import { setImportImageFile } from "../../actions/redux/index";
import transformActionFactory from "../../utils/TransformAction";

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
  }
}))`
  flex-grow: 0;
  flex-shrink: 0;
  position: relative;
  box-sizing: content-box;
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

let currentTransformAction = null;

export default function TransformObject({targetCtx, source, clip, children}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ h: 0, w: 0 });
  const [image, setImage] = useState(null);
  const [transformCanvasSize, setTransformCanvasSize] = useState({ x: 0, y: 0 });

  const { workspaceOffset, zoom } = useSelector(state => {
    let settings = state.ui.workspaceSettings;
    return {
      workspaceOffset: { x: settings.translateX, y: settings.translateY },
      zoom: settings.zoomPct / 100
    }
  });
  const { documentWidth, documentHeight } = useSelector(state => state.main.present.documentSettings);

  const dispatch = useDispatch();

  const canvasRef = useRef();
  const boundingBoxRef = useRef();

  useEffect(() => {
    if (source instanceof File) {
      const image = new Image();
      image.src = URL.createObjectURL(source);
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
    } else if (source instanceof HTMLCanvasElement) {
      if (clip) {
        const ctx = source.getContext("2d");
        ctx.save();
        ctx.clip(clip);
      }
    }
  }, [source]);

  useEffect(() => {
    if (!image) return;
    canvasRef.current.getContext('2d').drawImage(image, 0, 0);
  }, [transformCanvasSize]);

  function handleMouseDown(ev, actionType) {
    if (ev.button !== 0) return;
    ev.stopPropagation();
    currentTransformAction = transformActionFactory(ev, size, setSize, offset, setOffset, zoom, {actionType});
    currentTransformAction.start(ev);
  }

  function handleMouseMove(ev) {
    if (!currentTransformAction) {return};
    currentTransformAction.move(ev);
  }

  function handleMouseUp() {
    currentTransformAction = null;
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
        overrideCursor={currentTransformAction ? currentTransformAction.actionType : null}
        ref={boundingBoxRef}
      >
        <ContainerSC
          offset={calculateOffset()}
          size={size}
          zoom={zoom}
          onMouseDown={ev => handleMouseDown(ev, "move")}
          overrideCursor={currentTransformAction ? currentTransformAction.actionType : null}
        >
          <CanvasSC width={transformCanvasSize.w} height={transformCanvasSize.h} clip={calculateClipping()} ref={canvasRef}/>
          {children}
        </ContainerSC>
      </BoundingBoxSC>
  )
}