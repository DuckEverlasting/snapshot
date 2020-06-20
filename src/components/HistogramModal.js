import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from "react-redux";
import { updateCanvas } from '../actions/redux'

import DraggableWindow from "./DraggableWindow";
import Histogram from "../utils/Histogram";

import { getAllHistogram } from "../utils/helpers";

function HistogramModal() {
  const activeCtx = useSelector(state => {
    const activeLayer = state.main.present.activeLayer;
    return state.main.present.layerCanvas[activeLayer].getContext("2d");
  });
  return (
    <DraggableWindow name={"Histogram"} resizable={false} initSize={{w: 300, h: 300}}>
      <HistogramCanvas sourceCtx={activeCtx}/>
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

function HistogramCanvas({sourceCtx}) {
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
    const histogram = new Histogram(sourceCtx);
    histogram.drawAll(canvasRef.current.getContext("2d"));
  }, [sourceCtx])

  return <HistogramWrapperSC size={{w: 300, h: 300}}>
    <HistogramSC width={300} height={300} ref={canvasRef} />
  </HistogramWrapperSC>
}

export default HistogramModal;
