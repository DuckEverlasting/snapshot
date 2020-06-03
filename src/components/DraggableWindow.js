import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";

const BoundingBoxSC = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
`;

const TransparentOverlaySC = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  user-select: none;
  cursor: ${(props) => (props.dragging ? "grabbing" : "auto")};
  outline: none;
`;

const InnerModalSC = styled.div.attrs((props) => ({
  style: {
    transform: `translateX(${props.offset.x}px)
    translateY(${props.offset.y}px)`,
    boxShadow: props.dragging ? "0 1.5px 6px #111111" : "0 .5px 3px #222222",
    width: props.dimensions ? props.dimensions.x + "px" : "auto",
    height: props.dimensions ? props.dimensions.y + "px": "auto"
  },
}))`
  position: absolute;
  border-radius: 3px;
  background: rgba(100, 100, 100, 0.9);
  color: white;
  user-select: none;
  cursor: auto;
`;

const TitleSC = styled.h3.attrs((props) => ({
  style: {
    background: props.caution ? "#ffe312" : "#303030",
    transition: props.caution ? "none" : "background 1s",
  },
}))`
  background: #303030;
  flex: 0 0;
  width: 100%;
  padding: 10px;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
  cursor: ${(props) => (props.dragging ? "grabbing" : "grab")};
`;

const ContentSC = styled.div`
  display: flex;
  align-items: stretch;
  height: calc(100% - 36px);
  padding: 10px;
`;

const SWResizeSC = styled.div`
  position: absolute;
  bottom: -7.5px;
  left: -7.5px;
  width: 15px;
  height: 15px;
  cursor: sw-resize;
`;

const SEResizeSC = styled.div`
  position: absolute;
  bottom: -7.5px;
  left: calc(100% - 7.5px);
  width: 15px;
  height: 15px;
  cursor: se-resize;
`;

export default function DraggableWindow({
  name,
  children,
  initPosition,
  initSize,
  minimumSize,
  resizable=true
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState("");
  const [dragOrigin, setDragOrigin] = useState({ x: null, y: null });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [modalDimensions, setModalDimensions] = useState(null);
  const [minSize, setMinSize] = useState(null);
  const [caution, setCaution] = useState(false);
  const [boundingDimensions, setBoundingDimensions] = useState({});

  const boundingBoxRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    let initWidth, initHeight;
    if (initSize) {
      initWidth = initSize.x;
      initHeight = initSize.y;
    } else {
      initWidth = Math.floor(modalRef.current.clientWidth);
      initHeight = Math.floor(modalRef.current.clientHeight);
    }
    setBoundingDimensions({
      x: Math.floor(boundingBoxRef.current.clientWidth),
      y: Math.floor(boundingBoxRef.current.clientHeight),
    });
    setModalDimensions({
      x: initWidth,
      y: initHeight
    });
    setMinSize(minimumSize || {
      x: initWidth,
      y: initHeight
    });
    setOffset(initPosition || {
      x: Math.floor(boundingBoxRef.current.clientWidth) / 2 - initWidth / 2,
      y: Math.floor(boundingBoxRef.current.clientHeight) / 3 - initHeight / 3
    });
  }, []);

  function handleMouseDown(ev, resizeType = "") {
    if (ev.button !== 0) return;
    setIsDragging(true);
    if (resizeType) {
      setIsResizing(resizeType)
    };
    setDragOrigin({
      x: ev.screenX,
      y: ev.screenY,
      w: modalDimensions.x,
      h: modalDimensions.y,
      offX: offset.x,
      offY: offset.y,
    });
    ev.stopPropagation();
  }

  function handleMouseMove(ev) {
    if (!isDragging) {
      return;
    }
    if (isDragging && ev.buttons === 0) {
      if (isResizing) setIsResizing("");
      return setIsDragging(false);
    }
    const x = ev.screenX - (dragOrigin.x - dragOrigin.offX);
    const y = ev.screenY - (dragOrigin.y - dragOrigin.offY);

    if (!isResizing) {
      setOffset({
        x: Math.min(
          Math.max(x, 0),
          boundingDimensions.x - dragOrigin.w
        ),
        y: Math.min(
          Math.max(y, 0),
          boundingDimensions.y - dragOrigin.h
        ),
      });
    } else if (isResizing === "se") {
      setModalDimensions({
        x: Math.max(minSize.x, dragOrigin.w + (ev.screenX - dragOrigin.x)),
        y: Math.max(minSize.y, dragOrigin.h + (ev.screenY - dragOrigin.y))
      });
    } else if (isResizing === "sw") {
      setOffset( prevOffset => ({
        x: Math.min(
          Math.max(x, 0),
          dragOrigin.offX + (dragOrigin.w - minSize.x)
        ),
        y: prevOffset.y
      }));
      setModalDimensions({
        x: Math.min(Math.max(minSize.x, dragOrigin.w - (ev.screenX - dragOrigin.x)), dragOrigin.offX + dragOrigin.w),
        y: Math.max(minSize.y, dragOrigin.h + (ev.screenY - dragOrigin.y))
      });
    }
  }

  function handleMouseUp() {
    if (!isDragging) return;
    setIsDragging(false);
    if (isResizing) setIsResizing("");
  }

  function handleClickOutside(ev) {
    setCaution(true);
    setTimeout(() => setCaution(false), 100);
    ev.stopPropagation();
  }

  return (
    <BoundingBoxSC ref={boundingBoxRef}>
      <TransparentOverlaySC
        onMouseDown={handleClickOutside}
        tabIndex={1}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        dragging={isDragging}
      />
      <InnerModalSC
        ref={modalRef}
        onMouseMove={handleMouseMove}
        onMouseDown={ev => ev.stopPropagation()}
        dragging={isDragging}
        offset={offset}
        dimensions={modalDimensions}
      >
        <TitleSC
          caution={caution}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          dragging={isDragging}
        >
          {name}
        </TitleSC>
        <ContentSC>{children}</ContentSC>
        {
          resizable && 
          <>
            <SWResizeSC 
              onMouseDown={ev => handleMouseDown(ev, "sw")}
              onMouseMove={handleMouseMove}
            />
            <SEResizeSC 
              onMouseDown={ev => handleMouseDown(ev, "se")}
              onMouseMove={handleMouseMove}
            />
          </>
        }
      </InnerModalSC>
    </BoundingBoxSC>
  );
}
