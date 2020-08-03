import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useSelector } from "react-redux";

const LayerWrapperSC = styled.div.attrs(props => ({
  style: {
    width: `${props.size.w}px`,
    height: `${props.size.h}px`,
  }
}))`
  display: ${props => props.visible ? "block" : "none"};
  transform: translate(.0125px, .0125px);
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

function PixelGrid() {
  const canvasRef = useRef(null);
  const documentHeight = useSelector(state => state.main.present.documentSettings.documentHeight);
  const documentWidth = useSelector(state => state.main.present.documentSettings.documentWidth);
  const zoom = useSelector(state => state.ui.workspaceSettings.zoomPct / 100);
  const docSize = {w: documentWidth, h: documentHeight};

  function getPattern() {
    let pattern = new OffscreenCanvas(30, 30);
    const patternCtx = pattern.getContext("2d");
    patternCtx.translate(.5, .5);
    patternCtx.lineWidth = 1;
    patternCtx.strokeStyle = 'rgba(128, 128, 128, 1)';
    patternCtx.beginPath();
    patternCtx.moveTo(-1, 29);
    patternCtx.lineTo(29, 29);
    patternCtx.lineTo(29, -1);
    patternCtx.stroke();
    patternCtx.translate(-.5, -.5);
    return pattern;
  }

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.translate(.5, .5);
    ctx.fillStyle = ctx.createPattern(getPattern(), "repeat");
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.translate(-.5, -.5);
  }, [])

  // useEffect(() => {
  //   const ctx = canvasRef.current.getContext("2d");
  //   if (zoom >= 10 && !gridIsVisible) {
  //     setGridIsVisible(true);
     
  //   } else if (zoom < 10 && gridIsVisible) {
  //     setGridIsVisible(false);
  //     ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  //   }
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [documentWidth, documentHeight, zoom]);

  return <LayerWrapperSC visible={zoom >= 15} size={docSize}>
    <LayerSC width={docSize.w * 30} height={docSize.h * 30} ref={canvasRef} />
  </LayerWrapperSC>
}

export default PixelGrid;
