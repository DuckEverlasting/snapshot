import React, { useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useSelector } from "react-redux";
import { getCanvas } from '../utils/helpers';

const LayerWrapperSC = styled.div.attrs(props => ({
  style: {
    width: `${props.size.w}px`,
    height: `${props.size.h}px`,
    transform: `
      translate(${props.dimensions.x}px, ${props.dimensions.y}px)
      scale(${props.zoom})
      translate(${props.dimensions.offX}px, ${props.dimensions.offY}px)
    `
  }
}))`
  display: ${props => props.visible ? "block" : "none"};
  position: absolute;
  overflow: hidden;
  pointer-events: none;
`

const LayerSC = styled.canvas`
  position: absolute;
  width: 100%;
  height: calc(100%);
  left: 0;
  top: 0;
  image-rendering: pixelated;
  image-rendering: optimizespeed;
  pointer-events: none;
`

function PixelGrid({ transX, transY, sizeW, sizeH, refRef }) {
  const canvasRef = useRef(null),
  activeProject = useSelector(state => state.main.activeProject),
  documentHeight = useSelector(state => state.main.projects[activeProject].present.documentSettings.documentHeight),
  documentWidth = useSelector(state => state.main.projects[activeProject].present.documentSettings.documentWidth),
    { translateX, translateY, zoomPct } = useSelector(state => state.ui.workspaceSettings),
    zoom = zoomPct / 100,
    docSize = {w: documentWidth, h: documentHeight};

  const getPattern = useCallback(zoom => {
    const dim = Math.max(zoom, 1);
    let pattern = getCanvas(dim, dim);
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
  }, [])

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    let pattern = getPattern(zoom);
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.fillStyle = ctx.createPattern(pattern, "repeat");
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    pattern = null;
  }, [sizeW, sizeH, zoom, getPattern])

  // function getDimensions() {
  //   let correctionX = -translateX / zoom / docSize.w * (docSize.w % 10) / 20;
  //   let correctionY = -translateY / zoom / docSize.h * (docSize.h % 10) / 20;
  //   return {
  //     x: (docSize.w - sizeW) / 2 - transX / zoom,
  //     y: (docSize.h - sizeH) / 2 - transY / zoom,
  //     offX: translateX % zoom + correctionX * zoom,
  //     offY: translateY % zoom + correctionY * zoom,
  //   }
  // }

  function getDimensions() {
    return {
      x: (docSize.w - sizeW) / 2 - transX / zoom,
      y: (docSize.h - sizeH) / 2 - transY / zoom,
      offX: translateX % zoom,
      offY: translateY % zoom,
    }
  }

  return <LayerWrapperSC dimensions={getDimensions()} zoom={1 / zoom} visible={zoom >= 15} size={{w: sizeW, h: sizeH}}>
    <LayerSC width={sizeW} height={sizeH} ref={canvasRef} />
  </LayerWrapperSC>
}

export default PixelGrid;
