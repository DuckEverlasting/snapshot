import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import selectFromActiveProject from "../utils/selectFromActiveProject";
import useEventListener from "../hooks/useEventListener";
import menuAction from "../actions/redux/menuAction";
import manipulate from "../reducers/custom/manipulateReducer";
import {
  setImportImageFile,
  setTransformTarget,
  putHistoryData,
  setTransformParams,
  setMenuIsDisabled,
  setActiveTool,
  setHistoryIsDisabled,
} from "../actions/redux";
import transformActionFactory from "../utils/TransformAction";
import getImageRect from "../utils/getImageRect";
import { calculateClipping, isCanvas } from "../utils/helpers";
import render from "../actions/redux/renderCanvas";

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
    width: props.size ? (props.size.w * props.zoom) + "px" : "auto",
    height: props.size ? (props.size.h * props.zoom) + "px" : "auto",
    cursor: props.overrideCursor || "move",
    border: props.borderStyle || "2px solid " + props.theme.colors.highlight,
  },
}))`
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
  border: 1px solid #888888;
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
  source
}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [anchorPoint, setAnchorPoint] = useState({x: .5, y: .5});
  const [rotation, setRotation] = useState(0);
  const [image, setImage] = useState(null);
  const [transformCanvasSize, setTransformCanvasSize] = useState({
    x: 0,
    y: 0,
  });
  const { startEvent, rotatable, resizable } = useSelector(state => state.ui.transformParams);

  const { workspaceOffset, zoom } = useSelector((state) => {
    let settings = state.ui.workspaceSettings;
    return {
      workspaceOffset: { x: settings.translateX, y: settings.translateY },
      zoom: settings.zoomPct / 100,
    };
  });
  const [documentSettings, activeLayer] = useSelector(selectFromActiveProject(
    "documentSettings", "activeLayer"
  ));
  const { documentWidth, documentHeight } = documentSettings ? documentSettings : {};
  const activeTool = useSelector(state => state.ui.activeTool);

  const [initLayer, ] = useState(activeLayer);
  const [initialized, setInitialized] = useState(false);

  const dispatch = useDispatch();

  const canvasRef = useRef();
  const anchorRef = useRef();

  useEffect(() => {
    dispatch(setActiveTool("move"));
    dispatch(setMenuIsDisabled(true));
    dispatch(setHistoryIsDisabled(true));
    setInitialized(true);
    return () => {
      dispatch(setMenuIsDisabled(false))
      dispatch(setHistoryIsDisabled(false))
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    if (source instanceof File) {
      const image = new Image();
      image.src = URL.createObjectURL(source);
      image.onload = () => {
        setImage(image);
        let initWidth = image.width;
        let initHeight = image.height;
        setOffset({
          x: (documentWidth - initWidth) / 2,
          y: (documentHeight - initHeight) / 2,
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
    } else if (isCanvas(source)) {
      const imageRect = getImageRect(source);
      if (!imageRect) {
        dispatch(setImportImageFile(null));
        dispatch(setTransformTarget(null, null));
        return;
      }
      setImage({ctx: source.getContext("2d"), rect: imageRect});
      setOffset({
        x: Math.floor(imageRect.x),
        y: Math.floor(imageRect.y),
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!image) return;
    if (image.ctx) {
      manipulate(canvasRef.current.getContext("2d"), {
        action: "paste",
        params: {
          sourceCtx: image.ctx,
          orig: {x: image.rect.x, y: image.rect.y},
          dest: {x: 0, y: 0},
        }
      });
      if (startEvent) {
        handleMouseDown(startEvent, "move");
      }
    } else {
      canvasRef.current.getContext("2d").drawImage(image, 0, 0);
    }
    dispatch(render());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, transformCanvasSize]);

  useEffect(() => {
    if (!initialized) return;
    if (activeTool !== "move" || activeLayer !== initLayer) {
      apply();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTool, activeLayer, initLayer, initialized]);

  function handleMouseDown(e, actionType) {
    if (e.button !== 0) return;
    e.stopPropagation && e.stopPropagation();
    if (!actionType) return;
    currentTransformAction = transformActionFactory(
      e,
      { 
        size,
        setSize,
        offset,
        setOffset,
        anchorPoint,
        setAnchorPoint,
        rotation,
        setRotation,
        zoom,
        anchorRef
      },
      { actionType }
    );
    currentTransformAction.start(e);
  }

  function handleMouseMove(e) {
    if (!currentTransformAction) {
      return;
    }
    currentTransformAction.move(e);
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

  const handleKeyDown = useCallback(
    (e) => {
      e.preventDefault();
      let modifier = window.navigator.platform.includes("Mac")
        ? e.metaKey
        : e.ctrlKey;
      if (e.key === "Escape") {
        cancel();
      } else if (e.key === "Enter") {
        apply();
      } else if (modifier && e.key === "r") {
        dispatch(setTransformParams({resizable: true, rotatable: true}))
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, offset, size, anchorPoint, rotation, documentHeight, documentWidth]
  );

  async function apply() {
    dispatch(putHistoryData(target, targetCtx, () => {
      manipulate(targetCtx, {
        action: "paste",
        params: {
          sourceCtx: canvasRef.current.getContext("2d"),
          dest: {
            x: Math.ceil(offset.x),
            y: Math.ceil(offset.y),
          },
          size,
          anchorPoint,
          rotation
        },
      });
      dispatch(render());
    }, null, { groupWithPrevious: true }));
    dispatch(setImportImageFile(null));
    dispatch(setTransformTarget(null, null));
  }

  function cancel() {
    dispatch(menuAction("undo"));
    dispatch(setImportImageFile(null));
    dispatch(setTransformTarget(null, null));
  }

  useEventListener("keydown", handleKeyDown);

  return (
    <BoundingBoxSC
      onMouseDown={(e) => handleMouseDown(e, rotatable ? "rotate" : null)}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onKeyDown={handleKeyDown}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
      overrideCursor={
        currentTransformAction ? currentTransformAction.actionType : null
      }
    >
      <ContainerSC
        offset={calculateOffset()}
        size={size}
        zoom={zoom}
        anchorPoint={anchorPoint}
        rotation={rotation}
        onMouseDown={(e) => handleMouseDown(e, "move")}
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
            onMouseDown={(e) => handleMouseDown(e, "n-resize")}
          />
          <SResizeSC
            onMouseDown={(e) => handleMouseDown(e, "s-resize")}
          />
          <EResizeSC
            onMouseDown={(e) => handleMouseDown(e, "e-resize")}
          />
          <WResizeSC
            onMouseDown={(e) => handleMouseDown(e, "w-resize")}
          />
          <NEResizeSC
            onMouseDown={(e) => handleMouseDown(e, "ne-resize")}
          />
          <SEResizeSC
            onMouseDown={(e) => handleMouseDown(e, "se-resize")}
          />
          <SWResizeSC
            onMouseDown={(e) => handleMouseDown(e, "sw-resize")}
          />
          <NWResizeSC
            onMouseDown={(e) => handleMouseDown(e, "nw-resize")}
          />
        </>}
        {rotatable && <AnchorPointSC
          anchorPoint={{x: anchorPoint.x * size.w, y: anchorPoint.y * size.h}}
          ref={anchorRef}
          zoom={zoom}
          onMouseDown={(e) => handleMouseDown(e, "move-anchor")}
        >
          <AnchorPointRectSC />
          <AnchorPointCircleSC />
        </AnchorPointSC>}
      </ContainerSC>
    </BoundingBoxSC>
  );
}
