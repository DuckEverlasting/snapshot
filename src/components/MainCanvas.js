import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from "react-redux";
import { updateLayerCanvas } from '../actions/redux'

const LayerWrapperSC = styled.div.attrs(props => ({
  style: {
    width: `${props.size.w}px`,
    height: `${props.size.h}px`
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

function MainCanvas() {
  const canvasRef = useRef(null);
  const { documentWidth, documentHeight } = useSelector(state => state.main.present.documentSettings);
  const docSize = {w: documentWidth, h: documentHeight};

  const dispatch = useDispatch();

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    dispatch(updateLayerCanvas("main", canvasRef.current));

    return () => dispatch(updateLayerCanvas("main", null));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <LayerWrapperSC size={docSize}>
    <LayerSC width={docSize.w} height={docSize.h} ref={canvasRef} />
  </LayerWrapperSC>
}

export default MainCanvas;
