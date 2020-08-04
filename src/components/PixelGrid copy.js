import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useSelector } from "react-redux";
import { calculateClipping } from "../utils/helpers";

const LayerWrapperSC = styled.div.attrs(props => ({
  style: {
    width: `${props.size.w}px`,
    height: `${props.size.h}px`,
    clipPath: `inset(${props.clip.up}px ${props.clip.right}px ${props.clip.down}px ${props.clip.left}px)`
  }
}))`
  display: ${props => props.visible ? "block" : "none"};
  position: absolute;
  overflow: hidden;
  pointer-events: none;
`

const LayerSC = styled.canvas.attrs(props => ({
  style: {
    transform: `
      translate(${props.dimensions.offX}px, ${props.dimensions.offY}px)
    `
  }
}))`
  position: absolute;
  width: 100%;
  height: calc(100%);
  left: 0;
  top: 0;
  image-rendering: pixelated;
  pointer-events: none;
`

function PixelGrid({ transX, transY, sizeW, sizeH, correction }) {
  const canvasRef = useRef(null),
    documentHeight = useSelector(state => state.main.present.documentSettings.documentHeight),
    documentWidth = useSelector(state => state.main.present.documentSettings.documentWidth),
    { translateX, translateY, zoomPct } = useSelector(state => state.ui.workspaceSettings),
    zoom = zoomPct / 100,
    docSize = {w: documentWidth, h: documentHeight};

  function getPattern() {
    const dim = Math.max(zoom, 1);
    let pattern = new OffscreenCanvas(dim, dim);
    const patternCtx = pattern.getContext("2d");
    // patternCtx.translate(-.5, -.5);
    patternCtx.lineWidth = 1;
    patternCtx.strokeStyle = 'rgba(128, 128, 128, 1)';
    patternCtx.beginPath();
    patternCtx.moveTo(-1, dim);
    patternCtx.lineTo(dim, dim);
    patternCtx.lineTo(dim, -1);
    patternCtx.stroke();
    // patternCtx.translate(.5, .5);
    return pattern;
  }

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    let pattern = getPattern();
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.fillStyle = ctx.createPattern(pattern, "repeat");
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, pattern.width * 2, pattern.height * 2);
    pattern = null;
  }, [sizeW, sizeH, zoom])

  function getDimensions() {
    return {
      x: (docSize.w - sizeW) / 2 - transX / zoom,
      y: (docSize.h - sizeH) / 2 - transY / zoom,
      offX: translateX % zoom,
      offY: translateY % zoom,
    }
  }

  function calculateClipping() {
    console.log({translateX, translateY, zoom})
    console.log(sizeH)
    console.log(docSize.h * zoom + translateY - sizeH)
    return {
      up: translateY - 1,
      down: -docSize.h * zoom - translateY + sizeH,
      left: translateX - 1,
      right: -docSize.w * zoom - translateX + sizeW,
    };
  }

  return <LayerWrapperSC zoom={1 / zoom} clip={calculateClipping()} visible={zoom >= 15} size={{w: sizeW, h: sizeH}}>
    <LayerSC dimensions={getDimensions()} width={sizeW} height={sizeH} ref={canvasRef} />
  </LayerWrapperSC>
}

export default PixelGrid;

