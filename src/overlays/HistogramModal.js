import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from "react-redux";
import { updateUtilityCanvas, setOverlay } from '../actions/redux'

import DraggableWindow from "../components/DraggableWindow";
import Histogram from "../utils/Histogram";

function HistogramModal() {
  const activeCtx = useSelector(state => {
    const activeProject = state.main.activeProject;
    const activeLayer = state.main.present.activeLayer;
    return state.main.projects[activeProject].present.layerCanvas[activeLayer].getContext("2d");
  });
  return (
    <DraggableWindow name={"Histogram"} resizable initSize={{w: 256, h: 256}} minimumSize={{w: 100, h: 100}}>
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
  flex: 1 1 256px;
  min-height: 0;
  left: 0;
  top: 0;
  image-rendering: pixelated;
  image-rendering: optimizespeed;
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
    dispatch(updateUtilityCanvas("histogram", canvasRef.current));

    return () => dispatch(updateUtilityCanvas("histogram", null));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const histogram = new Histogram(sourceCtx);
    histogram.drawAll(canvasRef.current.getContext("2d"));
  }, [sourceCtx])

  function handleMouseDown(e) {
    dispatch(setOverlay("histogram"));
    e.stopPropagation();
  }

  return <HistogramWrapperSC onEscape={() => dispatch(setOverlay("histogram"))}>
    <HistogramSC width={1024} height={1024} ref={canvasRef} />
    <CloseButtonSC onClick={handleMouseDown}>Close</CloseButtonSC>
  </HistogramWrapperSC>
}

export default HistogramModal;
