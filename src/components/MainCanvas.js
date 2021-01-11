import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useDispatch } from "react-redux";
import { updateMainCanvas } from '../store/actions/redux'

const LayerSC = styled.canvas`
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  image-rendering: pixelated;
  image-rendering: optimizespeed;
  pointer-events: none;
`

function MainCanvas({ dpi }) {
  const canvasRef = useRef(null);

  const dispatch = useDispatch();

  const [ calcSize, setCalcSize ] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    dispatch(updateMainCanvas(canvasRef.current));

    return () => dispatch(updateMainCanvas(null));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    setCalcSize({w: canvasRef.current.clientWidth * dpi, h: canvasRef.current.clientHeight * dpi});
  }, [dpi])

  return <LayerSC width={calcSize.w} height={calcSize.h} ref={canvasRef} />
}

export default MainCanvas;
