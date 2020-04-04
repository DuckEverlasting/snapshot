import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";

const BoundingBoxSC = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
`

const TransparentOverlaySC = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  user-select: none;
  cursor: ${props => props.dragging ? "grabbing" : "auto"};
  outline: none;
`

const InnerModalSC = styled.div.attrs(props => ({
  style: {
    transform: `translateX(${props.offset.x}px)
    translateY(${props.offset.y}px)`,
    boxShadow: props.dragging ? "0 1.5px 6px #111111" : "0 .5px 3px #222222"
  }
}))`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 3px;
  background: rgba(100, 100, 100, .9);
  color: white;
  user-select: none;
  cursor: auto;
`

const TitleSC = styled.h3.attrs(props => ({
  style: {
    background: props.caution ? "#ffe312" : "#303030",
    transition: props.caution ? "none" : "background 1s"
  }
}))`
  background: #303030;
  width: 100%;
  padding: 10px;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
  cursor: ${props => props.dragging ? "grabbing" : "grab"};
`

const ContentSC = styled.div`
  padding: 10px;
`

export default function DraggableWindow({name, children, initPosition}) { 
  const [isDragging, setIsDragging] = useState(false);
  const [dragOrigin, setDragOrigin] = useState({ x: null, y: null });
  const [offset, setOffset] = useState({x: 0, y: 0});
  const [caution, setCaution] = useState(false);
  const [dimensions, setDimensions] = useState({});

  const boundingBoxRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    setDimensions({
      x: boundingBoxRef.current.clientWidth,
      y: boundingBoxRef.current.clientHeight
    })
    let x = boundingBoxRef.current.clientWidth / 2 - modalRef.current.clientWidth / 2
    let y = boundingBoxRef.current.clientHeight / 3 - modalRef.current.clientHeight / 3
    setOffset(initPosition || {x, y})
  }, [])

  function handleMouseDown(ev) {
    if (ev.button !== 0) return;
    setIsDragging(true);
    setDragOrigin({x: ev.screenX - offset.x, y: ev.screenY - offset.y});
    ev.stopPropagation();
  };

  function handleMouseMove(ev) {
    if (!isDragging) {return}
    if (isDragging && ev.buttons === 0) {
      return setIsDragging(false);
    }
    const x = ev.screenX - dragOrigin.x;
    const y = ev.screenY - dragOrigin.y;
    setOffset({
      x: Math.min(Math.max(x, 0), dimensions.x - modalRef.current.clientWidth),
      y: Math.min(Math.max(y, 0), dimensions.y - modalRef.current.clientHeight)
    })
  }

  function handleMouseUp() {
    if (!isDragging) return;
    setIsDragging(false);
  }

  function handleClickOutside(ev) {
    setCaution(true)
    setTimeout(() => setCaution(false), 100)
    ev.stopPropagation()
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
      >
        <TitleSC
          caution={caution}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          dragging={isDragging}
        >{name}</TitleSC>
        <ContentSC>
          {children}
        </ContentSC>
      </InnerModalSC>
    </BoundingBoxSC>
  );
}
