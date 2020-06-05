import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from "react-redux";
import { updateLayerCanvas } from '../actions/redux'

const LayerWrapperSC = styled.div.attrs(props => ({
  style: {
    width: `${props.size.w}px`,
    height: `${props.size.h}px`,
    title: props.title,
    zIndex: props.index,
    transform: `
      translateX(${props.offset.x}px)
      translateY(${props.offset.y}px)
    `,
    clipPath: props.edgeClip ? `inset(${props.edgeClip.up}px ${props.edgeClip.right}px ${props.edgeClip.down}px ${props.edgeClip.left}px)` : "none"
  }
}))`
  position: absolute;
  overflow: hidden;
  pointer-events: none;
`

const LayerSC = styled.canvas`
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  image-rendering: pixelated;
  pointer-events: none;
`

function Layer({id, docSize, size=docSize, offset={x: 0, y: 0}, index, data, hidden, edgeClip}) {
  const canvasRef = useRef(null);
  const onUndelete = useSelector(state => state.main.present.onUndelete);
  const dispatch = useDispatch();

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    if (data) {
      ctx.drawImage(data, 0, 0);
    }
    dispatch(updateLayerCanvas(id, canvasRef.current));
    if (onUndelete && onUndelete.id === id) {
      ctx.putImageData(onUndelete.data, 0, 0);
    }
  }, [onUndelete, id])

  return <LayerWrapperSC size={size} offset={offset} index={index} edgeClip={edgeClip}>
    <LayerSC title={`Layer ${id}`} width={size.w} height={size.h} hidden={hidden} ref={canvasRef} />
  </LayerWrapperSC>
}

export default React.memo(Layer)