import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from "react-redux";
import { updateLayerData } from '../actions/redux'

const LayerWrapperSC = styled.div.attrs(props => ({
  style: {
    width: `${props.width}px`,
    height: `${props.height}px`,
    title: props.title,
    zIndex: props.index
  }
}))`
  position: absolute;
  overflow: hidden;
  pointer-events: none;
`

const LayerSC = styled.canvas.attrs(props => ({
  style: {
    visibility: props => props.hidden ? "hidden" : "visible",
  }
}))`
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  image-rendering: pixelated;
  pointer-events: none;
`

function Layer(props) {
  const canvasRef = useRef(null);
  const onUndelete = useSelector(state => state.main.present.onUndelete);
  const layerData = useSelector(state => state.main.present.layerData[props.id]);
  const dispatch = useDispatch();

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    if (layerData) {
      ctx.drawImage(layerData, 0, 0);
    }
    dispatch(updateLayerData(props.id, canvasRef.current));
    if (onUndelete && onUndelete.id === props.id) {
      ctx.putImageData(onUndelete.data, 0, 0);
    }
  }, [onUndelete, props.id])

  console.log("LAYER ", props.id, " HAS ZINDEX OF ", props.index)

  return <LayerWrapperSC width={props.width} height={props.height} index={props.index}>
    <LayerSC title={`Layer ${props.id}`} width={Math.floor(props.width)} height={Math.floor(props.height)} hidden={props.hidden} ref={canvasRef} />
  </LayerWrapperSC>
}

export default React.memo(Layer)