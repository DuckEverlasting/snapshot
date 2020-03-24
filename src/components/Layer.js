import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from "react-redux";
import { updateLayerData } from '../actions/redux'

const LayerWrapperSC = styled.div.attrs(props => ({
  style: {
    width: `${props.width}px`,
    height: `${props.height}px`
  }
}))`
  position: absolute;
  overflow: hidden;
`

const LayerSC = styled.canvas.attrs(props => ({
  style: {
    visibility: props => props.hidden ? "hidden" : "visible",
    zIndex: props.index
  }
}))`
  position: absolute;
  width: 300%;
  height: 300%;
  bottom: -100%;
  right: -100%;
  image-rendering: pixelated;
`

function Layer(props) {
  const canvasRef = useRef(null);
  const onUndelete = useSelector(state => state.main.present.onUndelete); 
  const dispatch = useDispatch();

  useEffect(() => {
    canvasRef.current.getContext("2d").imageSmoothingEnabled = false;
    dispatch(updateLayerData(props.id, canvasRef.current));
    if (onUndelete && onUndelete.id === props.id) {
      const ctx = canvasRef.current.getContext("2d"); 
      const viewWidth = Math.ceil(ctx.canvas.width / 3);
      const viewHeight = Math.ceil(ctx.canvas.height / 3);
      ctx.putImageData(onUndelete.data, viewWidth, viewHeight);
    }
  }, [])

  return <LayerWrapperSC width={props.width} height={props.height}>
    <LayerSC width={props.width * 3} height={props.height * 3} hidden={props.hidden} index={props.index} ref={canvasRef} />
  </LayerWrapperSC>
}

export default React.memo(Layer)