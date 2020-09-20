// import React, { useEffect, useRef } from 'react';
// import styled from 'styled-components';
// import { useSelector } from "react-redux";
// import { getCanvas } from '../utils/helpers';

// const LayerWrapperSC = styled.div.attrs(props => ({
//   style: {
//     width: `${100}px`,
//     height: `${200}px`,
//     transform: `
//       translate(${props.dimensions.x}px, ${props.dimensions.y}px)
//     `
//   }
// }))`
//   display: ${props => props.visible ? "block" : "none"};
//   position: absolute;
//   overflow: hidden;
//   pointer-events: none;
// `

// const LayerSC = styled.canvas`
//   position: absolute;
//   width: 100%;
//   height: 100%;
//   left: 0;
//   top: 0;
//   image-rendering: pixelated;
//   image-rendering: optimizespeed;
//   pointer-events: none;
// `

// function PixelGrid({ transX, transY }) {
//   const canvasRef = useRef(null),
//     activeProject = useSelector(state => state.main.activeProject),
//     documentHeight = useSelector(state => state.main.projects[activeProject].present.documentSettings.documentHeight),
//     documentWidth = useSelector(state => state.main.projects[activeProject].present.documentSettings.documentWidth),
//     { translateX, translateY, zoomPct } = useSelector(state => state.ui.workspaceSettings),
//     zoom = zoomPct / 100,
//     docSize = {w: documentWidth, h: documentHeight};

//   function getPattern() {
//     let pattern = getCanvas(30, 30);
//     const patternCtx = pattern.getContext("2d");
//     patternCtx.translate(.5, .5);
//     patternCtx.lineWidth = 1;
//     patternCtx.strokeStyle = 'rgba(128, 128, 128, 1)';
//     patternCtx.beginPath();
//     patternCtx.moveTo(-1, 29);
//     patternCtx.lineTo(29, 29);
//     patternCtx.lineTo(29, -1);
//     patternCtx.stroke();
//     patternCtx.translate(-.5, -.5);
//     return pattern;
//   }

//   useEffect(() => {
//     const ctx = canvasRef.current.getContext("2d");
//     let pattern = getPattern();
//     ctx.imageSmoothingEnabled = false;
//     ctx.translate(.5, .5);
//     ctx.fillStyle = ctx.createPattern(getPattern(), "repeat");
//     ctx.fillStyle = "red";
//     ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//     ctx.translate(-.5, -.5);
//     pattern = null;
//   }, [])

//   function getDimensions() {
//     console.log(
//       "docW: ",
//       docSize.w,
//       "ovrW: ",
//       docSize.w / 4,
//       "transX: ",
//       translateX,
//       "calc: ",
//       ((docSize.w - 100) / 2) - transX
//     );
//     return {
//       x: ((docSize.w - 100) / 2) - transX / zoom,
//       y: ((docSize.h - 200) / 2) - transY / zoom
//     }
//   }

//   return <LayerWrapperSC dimensions={getDimensions()} visible={true} size={docSize}>
//     <LayerSC width={docSize.w * 30} height={docSize.h * 30} ref={canvasRef} />
//   </LayerWrapperSC>
// }

// export default PixelGrid;
