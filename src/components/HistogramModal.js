import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from "react-redux";
import { updateCanvas, toggleHistogram } from '../actions/redux'

import DraggableWindow from "./DraggableWindow";
import Histogram from "../utils/Histogram";

function HistogramModal() {
  const activeCtx = useSelector(state => {
    const activeLayer = state.main.present.activeLayer;
    return state.main.present.layerCanvas[activeLayer].getContext("2d");
  });
  return (
    <DraggableWindow name={"Histogram"} resizable>
      <HistogramCanvas sourceCtx={activeCtx}/>
    </DraggableWindow>
  )
}

const HistogramWrapperSC = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  position: relative;
`

const HistogramSC = styled.canvas`
  position: relative;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  image-rendering: pixelated;
  pointer-events: none;
  border: 2px solid black;
  margin-bottom: 10px;
`

const CloseButtonSC = styled.button`
  cursor: pointer;
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

  function handleMouseDown(ev) {
    dispatch(toggleHistogram());
    ev.stopPropagation();
  }

  return <HistogramWrapperSC>
    <HistogramSC width={256} height={256} ref={canvasRef} />
    <CloseButtonSC onClick={handleMouseDown}>Close</CloseButtonSC>
  </HistogramWrapperSC>
}

export default HistogramModal;
