import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";

const BoundingBoxSC = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid red;
`

const TransparentOverlaySC = styled.div`
  position: fixed;
  top: 0;
  height: 100vh;
  width: 100vw;
  z-index: 100;
  user-select: none;
  outline: none;
`

const InnerModalSC = styled.div.attrs(props => ({
  style: {
    transform: `translateX(${props.offset.x}px)
    translateY(${props.offset.y + 30}px)`
  }
}))`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 3px;
  background: rgba(100, 100, 100, .9);
  box-shadow: 0 .5px 3px #222222;
  color: white;
  z-index: 101;
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
`

const ContentSC = styled.div`
  padding: 10px;
`

export default function DraggableWindow({name, children}) { 
  const [isDragging, setIsDragging] = useState(false);
  const [dragOrigin, setDragOrigin] = useState({ x: null, y: null });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [caution, setCaution] = useState(false);
  const [dimensions, setDimensions] = useState({});

  const boundingBoxRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    setDimensions({
      x: boundingBoxRef.current.clientWidth,
      y: boundingBoxRef.current.clientHeight
    })
  }, [])

  const handleKeyDown = ev => {
    if (ev.key === "Escape") {
      handleClose();
    }
    ev.stopPropagation();
  }

  const handleClose = () => {

  }

  const handleMouseDown = ev => {
    console.log("HEY THERE")
    if (ev.button !== 0) return;
    setIsDragging(true);
    setDragOrigin({x: ev.screenX - offset.x, y: ev.screenY - offset.y});
    ev.stopPropagation();
  };

  const handleMouseMove = ev => {
    if (!isDragging) {return}
    const x = ev.screenX - dragOrigin.x;
    const y = ev.screenY - dragOrigin.y;
    setOffset({
      x: Math.min(Math.max(x, 0), dimensions.x - modalRef.current.clientWidth),
      y: Math.min(Math.max(y, 0), dimensions.y - modalRef.current.clientHeight)
    })
    console.log(Math.min(Math.max(x, 0), dimensions.x - modalRef.current.clientWidth))
  }

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
  }

  const handleClickOutside = (ev) => {
    setCaution(true)
    setTimeout(() => setCaution(false), 100)
    ev.stopPropagation()
  }

  return (
    <BoundingBoxSC ref={boundingBoxRef}>
      <TransparentOverlaySC
        onMouseDown={handleClickOutside}
        onKeyDown={handleKeyDown}
        tabIndex={1}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <InnerModalSC ref={modalRef} onMouseDown={ev => ev.stopPropagation()} offset={offset}>
          <TitleSC
            caution={caution}
            onMouseDown={handleMouseDown}
          >{name}</TitleSC>
          <ContentSC>
            {children}
          </ContentSC>
        </InnerModalSC>
      </TransparentOverlaySC>
    </BoundingBoxSC>
  );
}
