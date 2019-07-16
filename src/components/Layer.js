import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

import draw from "../reducers/drawingReducer.js";
import { clearLayerQueue } from '../actions/';

const LayerSC = styled.canvas`
  position: absolute;
  visibility: ${props => props.hidden ? "hidden" : "visible"};
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  left: 0%;
  top: 0%;
  z-index: ${props => props.index};
`

function Layer(props) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (props.queue === null) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (props.id === "temp") {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    draw(ctx, props.queue);
    clearLayerQueue(props.id);
  }, [props.data, props.queue, props.id]);

  return <LayerSC width={props.width} height={props.height} hidden={props.hidden} index={props.index} ref={canvasRef} />
}

export default React.memo(Layer)