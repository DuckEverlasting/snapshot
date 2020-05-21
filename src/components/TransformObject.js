import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import useEventListener from "../hooks/useEventListener";
import menuAction from "../actions/redux/menuAction";
import manipulate from "../reducers/custom/manipulateReducer";
import { setImportImageFile, setTransformSelection, updateSelectionPath, putHistoryData } from "../actions/redux/index";
import transformActionFactory from "../utils/TransformAction";
import getImageRect from "../utils/getImageRect";
import { calculateClipping } from "../utils/helpers";

import styled from "styled-components";

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
                translateY(${props.offset.y}px)
                rotate(${props.rotation}rad)`,
    transformOrigin: `${props.anchorPoint.x * 100}% ${props.anchorPoint.y * 100}%`,
    width: props.size ? props.size.w * props.zoom + "px" : "auto",
    height: props.size ? props.size.h * props.zoom + "px" : "auto",
    cursor: props.overrideCursor || "move",
    border: props.borderStyle || "2px solid #ffe312",
  },
}))`
  flex-grow: 0;
  flex-shrink: 0;
  position: relative;
  box-sizing: content-box;
`;

const ClipCheckSC = styled.div.attrs((props) => ({
  style: {
    transform: `rotate(${-props.rotation}rad)`,
    transformOrigin: `${props.anchorPoint.x * 100}% ${props.anchorPoint.y * 100}%`,
    clipPath: `inset(${props.clip.up}px ${props.clip.right}px ${props.clip.down}px ${props.clip.left}px)`
  }
}))`
  position: absolute;
  width: 100%;
  height: 100%;
`;

const CanvasSC = styled.canvas.attrs((props) => ({
  style: {
    transform: `rotate(${props.rotation}rad)`,
    transformOrigin: `${props.anchorPoint.x * 100}% ${props.anchorPoint.y * 100}%`,
  },
}))`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 1px solid black;
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

const AnchorPointSC = styled.div.attrs(props => ({
  style: {
    transform: `translateX(${props.anchorPoint.x * props.zoom - 10}px)
                translateY(${props.anchorPoint.y * props.zoom - 10}px)`,
  }
}))`
  position: absolute;
  width: 20px;
  height: 20px;
`
const AnchorPointRectSC = styled.div`
  position: absolute;
  width: 60%;
  height: 60%;
  margin: 20%;
  border: 1px solid black;
  background: white;
`

const AnchorPointCircleSC = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border: 1px solid black;
  border-radius: 50%;
`

let currentTransformAction = null;

export default function TransformObject({
  target,
  targetCtx,
  source,
  resizable=true,
  rotatable=true
}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ h: 0, w: 0 });
  const [anchorPoint, setAnchorPoint] = useState({x: .5, y: .5});
  const [rotation, setRotation] = useState(0);
  const [image, setImage] = useState(null);
  const [transformCanvasSize, setTransformCanvasSize] = useState({
    x: 0,
    y: 0,
  });

  const { workspaceOffset, zoom } = useSelector((state) => {
    let settings = state.ui.workspaceSettings;
    return {
      workspaceOffset: { x: settings.translateX, y: settings.translateY },
      zoom: settings.zoomPct / 100,
    };
  });
  const { documentWidth, documentHeight } = useSelector(
    (state) => state.main.present.documentSettings
  );
  const selectionPath = useSelector(state => state.main.present.selectionPath);
  const selectionCtx = useSelector(state => state.main.present.layerData.selection.getContext("2d"));

  const dispatch = useDispatch();

  const canvasRef = useRef();
  const boundingBoxRef = useRef();
  const anchorRef = useRef();

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
          y: 0,
        });
        setSize({
          w: initWidth,
          h: initHeight,
        });
        setTransformCanvasSize({
          w: initWidth,
          h: initHeight,
        });
      };
    } else if (source && source.ctx) {
      const imageRect = getImageRect(source.ctx.canvas, selectionPath);
      setImage({...source, rect: imageRect});
      setOffset({
        x: Math.floor(imageRect.x + (imageRect.w - documentWidth) / 2),
        y: Math.floor(imageRect.y + (imageRect.h - documentHeight) / 2),
      });
      setSize({
        w: imageRect.w,
        h: imageRect.h,
      });
      setTransformCanvasSize({
        w: imageRect.w,
        h: imageRect.h,
      });
    }
  }, [source]);

  useEffect(() => {
    if (!image) return;
    if (image.ctx) {
      manipulate(canvasRef.current.getContext("2d"), {
        action: "paste",
        params: {
          sourceCtx: image.ctx,
          orig: {x: image.rect.x, y: image.rect.y},
          dest: {x: 0, y: 0},
          clipWithOffset: selectionPath
        }
      });
      manipulate(image.ctx, {
        action: "clear",
        params: {
          clip: selectionPath
        }
      })
      manipulate(selectionCtx, {
        action: "clear",
        params: { selectionPath: null }
      })
      dispatch(updateSelectionPath(null, true));
      if (image.startEvent) {
        handleMouseDown(image.startEvent, "move");
      }
    } else {
      canvasRef.current.getContext("2d").drawImage(image, 0, 0);
    }
  }, [image, transformCanvasSize]);

  function handleMouseDown(ev, actionType) {
    if (ev.button !== 0) return;
    ev.stopPropagation && ev.stopPropagation();
    currentTransformAction = transformActionFactory(
      ev,
      size,
      setSize,
      offset,
      setOffset,
      anchorPoint,
      setAnchorPoint,
      rotation,
      setRotation,
      zoom,
      anchorRef,
      { actionType }
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
    if (!boundingBoxRef.current) {
      return { x: 0, y: 0 };
    }
    const xFromCenter =
      (boundingBoxRef.current.clientWidth - size.w * zoom) / 2;
    const yFromCenter =
      (boundingBoxRef.current.clientHeight - size.h * zoom) / 2;
    return {
      x: xFromCenter + workspaceOffset.x + offset.x * zoom,
      y: yFromCenter + workspaceOffset.y + offset.y * zoom,
    };
  }

  const handleKeyDown = useCallback(
    (ev) => {
      ev.stopPropagation();
      if (ev.key === "Escape") {
        dispatch(menuAction("undo"));
        dispatch(setImportImageFile(null));
      } else if (ev.key === "Enter") {
        manipulate(targetCtx, {
          action: "paste",
          params: {
            sourceCtx: canvasRef.current.getContext("2d"),
            dest: {
              x: Math.ceil(offset.x - 0.5 * size.w + 0.5 * documentWidth),
              y: Math.ceil(offset.y - 0.5 * size.h + 0.5 * documentHeight),
            },
            size,
            anchorPoint,
            rotation
          },
        })
        dispatch(setImportImageFile(null));
        dispatch(setTransformSelection(null, null, null, true));
      }
    },
    [dispatch, offset, size, anchorPoint, rotation, documentHeight, documentWidth]
  );

  useEventListener("keydown", handleKeyDown);

  return (
    <BoundingBoxSC
      onMouseDown={(ev) => handleMouseDown(ev, "rotate")}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onKeyDown={handleKeyDown}
      onDragOver={(ev) => ev.preventDefault()}
      onDrop={(ev) => ev.preventDefault()}
      overrideCursor={
        currentTransformAction ? currentTransformAction.actionType : null
      }
      ref={boundingBoxRef}
    >
      <ContainerSC
        offset={calculateOffset()}
        size={size}
        zoom={zoom}
        anchorPoint={anchorPoint}
        rotation={rotation}
        onMouseDown={(ev) => handleMouseDown(ev, "move")}
        overrideCursor={
          currentTransformAction ? currentTransformAction.actionType : null
        }
      >
        <ClipCheckSC
          rotation={rotation}
          anchorPoint={anchorPoint}
          clip={calculateClipping(size, offset, {w: documentWidth, h: documentHeight}, zoom)}
        >
          <CanvasSC
            width={transformCanvasSize.w}
            height={transformCanvasSize.h}
            rotation={rotation}
            anchorPoint={anchorPoint}
            ref={canvasRef}
          />
        </ClipCheckSC>
        {resizable && <>
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
        </>}
        {rotatable && <AnchorPointSC
          anchorPoint={{x: anchorPoint.x * size.w, y: anchorPoint.y * size.h}}
          ref={anchorRef}
          zoom={zoom}
          onMouseDown={(ev) => handleMouseDown(ev, "move-anchor")}
        >
          <AnchorPointRectSC />
          <AnchorPointCircleSC />
        </AnchorPointSC>}
      </ContainerSC>
    </BoundingBoxSC>
  );
}
