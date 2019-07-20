import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useDispatch } from "react-redux";
import { updateLayerData } from '../actions'

import draw from "../reducers/drawingReducer.js";

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
  const dispatch = useDispatch();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let queue = props.queue;
    if (queue === null) return;
    if (queue.type === "draw") drawHandler(ctx, queue)
  }, [props.data, props.queue, props.id]);

  function drawHandler(ctx, queue) {
    if (queue.clearFirst) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    }
    if (queue.composite) {
      ctx.globalCompositeOperation = queue.composite
    } else {
      ctx.globalCompositeOperation = "source-over"
    }
    draw(ctx, queue);
    dispatch(updateLayerData(props.id, canvasRef.current))
  }

  return <LayerSC width={props.width} height={props.height} hidden={props.hidden} index={props.index} ref={canvasRef} />
}

export default React.memo(Layer)