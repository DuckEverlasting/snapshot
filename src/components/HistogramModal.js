import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from "react-redux";
import { updateCanvas } from '../actions/redux'

import DraggableWindow from "./DraggableWindow";

import { getAllHistogram } from "../utils/helpers";

function HistogramModal() {
  const activeCtx = useSelector(state => {
    const activeLayer = state.main.present.activeLayer;
    return state.main.present.layerCanvas[activeLayer].getContext("2d");
  });
  return (
    <DraggableWindow name={"Histogram"} resizable={false} initSize={{w: 300, h: 300}}>
      <Histogram data={getAllHistogram(activeCtx)}/>
    </DraggableWindow>
  )
}

const HistogramWrapperSC = styled.div.attrs(props => ({
  style: {
    width: `${props.size.w}px`,
    height: `${props.size.h}px`
  }
}))`
  position: relative;
  overflow: hidden;
  pointer-events: none;
`

const HistogramSC = styled.canvas`
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  image-rendering: pixelated;
  pointer-events: none;
`

function Histogram({data}) {
  const canvasRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    dispatch(updateCanvas("histogram", canvasRef.current));

    return () => dispatch(updateCanvas("histogram", null));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.fillStyle = "#000000"
    ctx.strokeStyle = "#FFFFFF"
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.beginPath();
    const max = Math.max(...data[3]);
    console.log(max);
    for (let i = 0; i < 255; i++) {
      ctx.moveTo(10 + i, 290);
      ctx.lineTo(10 + i, 290 - data[3][i] * (280 / max));
    }
    ctx.stroke();
  }, [data])

  return <HistogramWrapperSC size={{w: 300, h: 300}}>
    <HistogramSC width={300} height={300} ref={canvasRef} />
  </HistogramWrapperSC>
}

export default HistogramModal;
